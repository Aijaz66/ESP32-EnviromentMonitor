import React, { useState } from "react";
import axios from "axios";
import { Upload, X, AlertTriangle, Wifi, CheckCircle, Info } from "lucide-react";

const OtaUploader = ({ isOpen, onClose, darkMode }) => {
  const [espIp, setEspIp] = useState("192.168.100.101");
  const [binFile, setBinFile] = useState(null);
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!espIp.trim() || !binFile) {
      setStatus({ msg: "Please enter ESP32 IP and select a .bin file", type: "error" });
      return;
    }

    const form = new FormData();
    form.append("firmware", binFile);  // Changed from "update" to "firmware" to match backend
    form.append("espIp", espIp);  // Added ESP IP to form data

    try {
      setUploading(true);
      setStatus({ msg: "Starting upload…", type: "info" });
      setProgress(0);

      // Changed to use your backend endpoint instead of direct ESP32 connection
      await axios.post(
        "https://esp-32-enviroment-monitor-backend1.vercel.app/ota-upload",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: ev => {
            const pct = Math.round(100 * ev.loaded / ev.total);
            setProgress(pct);
            setStatus({ msg: `Uploading… ${pct}%`, type: "info" });
          },
          timeout: 150000
        }
      );

      setStatus({ msg: "Upload complete! ESP will reboot.", type: "success" });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message;
      setStatus({ msg: `Upload failed: ${errMsg}`, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBinFile(e.target.files[0]);
      setStatus({ msg: "", type: "" });
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getStatusStyles = () => {
    if (status.type === "error") {
      return darkMode 
        ? "bg-red-900 bg-opacity-20 text-red-400" 
        : "bg-red-100 text-red-800";
    } else if (status.type === "success") {
      return darkMode 
        ? "bg-green-900 bg-opacity-20 text-green-400" 
        : "bg-green-100 text-green-800";
    } else if (status.type === "info") {
      return darkMode 
        ? "bg-blue-900 bg-opacity-20 text-blue-400" 
        : "bg-blue-100 text-blue-800";
    }
    return "";
  };

  const StatusIcon = () => {
    if (status.type === "error") return <AlertTriangle className="h-5 w-5 mr-2" />;
    if (status.type === "success") return <CheckCircle className="h-5 w-5 mr-2" />;
    if (status.type === "info") return <Info className="h-5 w-5 mr-2" />;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} max-w-md w-full rounded-lg shadow-xl p-6 mx-4`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Upload className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-xl font-bold">ESP32 OTA Uploader</h2>
          </div>
          <button 
            onClick={handleClose}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            disabled={uploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ESP32 IP Address
          </label>
          <div className="flex items-center">
            <Wifi className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="192.168.100.101"
              value={espIp}
              onChange={e => setEspIp(e.target.value)}
              className={`w-full p-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border focus:outline-none ${
                darkMode ? 'focus:border-blue-500' : 'focus:border-blue-600'
              }`}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Firmware Binary File (.bin)
          </label>
          <div className={`p-4 border-2 border-dashed rounded-lg text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            {binFile ? (
              <div>
                <p className="mb-2 font-medium">{binFile.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(binFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="py-4">
                <Upload className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Select firmware .bin file
                </p>
                <label className={`cursor-pointer inline-block px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  Browse Files
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".bin"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {!!status.msg && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${getStatusStyles()}`}>
            <StatusIcon />
            <p>{status.msg}</p>
          </div>
        )}

        {progress > 0 && (
          <div className="mb-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className={`text-xs font-semibold inline-block ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload Progress
                  </span>
                </div>
                <div>
                  <span className={`text-xs font-semibold inline-block ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {progress}%
                  </span>
                </div>
              </div>
              <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  style={{ width: `${progress}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    darkMode ? 'bg-blue-500' : 'bg-blue-600'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className={`px-4 py-2 rounded-md ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:opacity-60' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100 disabled:opacity-60'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={upload}
            disabled={uploading || !binFile}
            className={`px-4 py-2 rounded-md flex items-center ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:opacity-60' 
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:opacity-60'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              'Upload Firmware'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtaUploader;
