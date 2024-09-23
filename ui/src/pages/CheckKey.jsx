import { Link, useNavigate } from "react-router-dom";
import rabbit from "../assets/icons/rabbit.png";
import { useContext, useEffect, useState } from "react";
// import toastContext from "../contexts/notifyContext";
import { useFormik } from "formik";

const CheckKey = () => {
  const navigate = useNavigate();
  // const { toast } = useContext(toastContext);
  const ipcRenderer = window.ipcRenderer;
  const [userKey, setUserKey] = useState("");
  const formik = useFormik({
    initialValues: {
      activeKey:
        "9f3972453fbdad82c354af80f8892ba05087b37d1b21d8937ccb20b808501348",
    },
  });
  const handleCopy = () => {
    navigator.clipboard
      .writeText(userKey)
      .then(() => {
        // toast("Copied !", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  const handleActivePrivateKey = () => {
    ipcRenderer.send("active:key", {
      activeKey: formik.values.activeKey,
    });
    ipcRenderer.once("active:key", (event, data) => {
      if (data.response === "OK") {
        // toast("Activated !", "success");
        navigate("/start");
      } else {
        // toast(data.response, "error");
      }
    });
  };

  useEffect(() => {
    ipcRenderer.send("get-key", {});
    ipcRenderer.on("get-key", (event, data) => {
      setUserKey(data.userKey);
    });
    ipcRenderer.send("check:active-key", {});
    ipcRenderer.on("check:active-key", (event, data) => {
      if (data.response === "OK") {
        navigate("/start");
      }
    });
  }, []);
  return (
    <div className="flex h-lvh w-lvw items-center justify-center bg-[#17182c]">
      <div className="flex h-5/6 w-2/3 flex-col items-center justify-center gap-5 rounded-lg bg-[#27273f] p-5 sm:w-1/2 xl:w-1/3">
        <img src={rabbit} alt={rabbit} className="h-16 w-16" />
        <div className="flex flex-col items-center justify-center">
          <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-3xl font-black text-transparent">
            ETH SCANNER
          </h1>
          <div className="flex w-[90%] gap-2">
            <p className="flex-1 rounded border-1 border-solid border-gray-700 py-0.5 text-center text-[10px] text-gray-400">
              VIETNAMESE
            </p>
            <p className="flex-1 rounded border-1 border-solid border-gray-700 py-0.5 text-center text-[10px] text-gray-400">
              ENGLISH
            </p>
          </div>
        </div>
        <p className="w-5/6 text-center text-sm text-gray-300">
          Please submit the code below and a photo capture payment information
          for Admin via the channels below to receive private key activation
          tool
        </p>
        <div className="flex gap-2">
          <a href="" className="text-xs font-bold text-green-400">
            Telegram
          </a>
          <a href="" className="text-xs font-bold text-green-400">
            Telegram Chanel
          </a>
        </div>
        <div className="flex w-[80%]">
          <input
            readOnly
            type="text"
            value={userKey}
            className="flex-1 rounded-s border-1 border-solid border-gray-700 bg-transparent px-3 py-2 text-xs text-gray-300 outline-none"
          />
          <button
            className="rounded-e bg-gray-700 px-4 text-xs font-bold text-green-400 hover:bg-gray-600"
            onClick={() => handleCopy()}
          >
            Copy
          </button>
        </div>
        <input
          id="activeKey"
          type="text"
          placeholder="Enter private key here..."
          className="w-[80%] rounded border-1 border-solid border-gray-700 bg-transparent px-3 py-2 text-xs text-gray-300 outline-none"
          onChange={formik.handleChange}
        />
        <div className="mt-4 flex w-[60%] gap-3">
          {/* <Link
            to="/start"
            className="text-center py-2 flex-1 relative rounded border border-solid border-purple-500 bg-purple-500 text-xs font-bold leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover hover:shadow-custom-inset"
          >
            Try it out
          </Link> */}
          <button
            className="relative flex-1 rounded border border-solid border-pink-500 bg-pink-500 py-2 text-xs font-bold leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover2 hover:shadow-custom-inset-pink"
            onClick={() => handleActivePrivateKey()}
          >
            Active
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckKey;
