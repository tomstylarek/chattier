import React, { useState, useRef, useEffect } from "react";
import mime from "mime-types";

import mediaIcon from "./galery.svg";

function MediaModal({ displayMedia, uploadFile }) {
  const mediaFile = useRef(null);
  const [file, setFile] = useState(null);
  const [authorizedExtensions, setAuthorizedExtensions] = useState([
    "image/jpeg",
    "image/jpg",
    "image/png"
  ]);

  // excecute when the file state is updated
  useEffect(() => {
    sendFile();
  }, [file]);

  function handleClick() {
    mediaFile.current.click();
  }

  function isAuthorized(filename) {
    // check if it is an authorized type with mime
    return authorizedExtensions.includes(mime.lookup(filename));
  }

  function clearFile() {
    setFile(null);
  }

  function sendFile() {
    if (file !== null) {
      if (isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        // upload file to the parent component
        uploadFile(file, metadata);
        clearFile();
      }
    }
  }

  function addFile(event) {
    // event target files is an array of all the selected files
    const newFile = event.target.files[0];

    if (newFile) {
      // set the new file in the state
      setFile(newFile);
      // since the update of the state is asynchronous, the sendFile function will be
      // excecuted in the useEffect hook, looking for changes in the file state
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`MediaModal ${displayMedia && "open"}`}
    >
      <img src={mediaIcon} alt="Upload Media" title="Add a photo" />
      <input
        onChange={addFile}
        ref={mediaFile}
        type="file"
        accept=".jpg, .jpeg, .png"
        style={{ display: "none" }}
      />
    </div>
  );
}

export default MediaModal;
