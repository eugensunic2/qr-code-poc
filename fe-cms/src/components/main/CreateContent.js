import React, { useContext, useState } from 'react';
import { GlobalErrorContext } from '../../App';
import { contentEndpoint } from '../../config';
import { useTranslation } from 'react-i18next';

function CreateContent() {
  const { t } = useTranslation();
  const errorContext = useContext(GlobalErrorContext);
  const UPLOAD_LABEL_NAME = t('Choose file');
  
  const [obj, setData] = useState({
    imageName: '',
    imageNameError: false,
    imageDescription: '',
    imageDescriptionError: false,
    imageFiles: [],
    imageLabelName: '',
    imageFileValue: '',
    imageFilesError: false,
    qrCode: null
  });

  const isFrontendValid = () => {
    return (
      obj.imageName &&
      obj.imageDescription &&
      obj.imageFiles.length &&
      isImageFormatValid(obj.imageFiles[0].type)
    );
  };

  const isImageFormatValid = imageFormat => {
    const allowedFormats = ['png', 'jpg', 'jpeg', 'gif'];
    return allowedFormats.some(x => imageFormat.indexOf(x) > -1);
  };

  const uploadContent = () => {
    let imageNameErr = false;
    let imageDescriptionErr = false;
    let imageFilesErr = false;

    if (!isFrontendValid()) {
      if (!obj.imageName) {
        imageNameErr = true;
      }
      if (!obj.imageDescription) {
        imageDescriptionErr = true;
      }
      if (!obj.imageFiles.length || !isImageFormatValid(obj.imageFiles[0].type)) {
        imageFilesErr = true;
      }

      setData({
        ...obj,
        imageNameError: imageNameErr,
        imageDescriptionError: imageDescriptionErr,
        imageFilesError: imageFilesErr
      });
      return;
    }
    const form = new FormData();

    form.append('file', obj.imageName);
    form.append('file', obj.imageDescription);
    form.append('file', obj.imageFiles[0]);

    fetch(contentEndpoint.CREATE_CONTENT, {
      method: 'POST',
      body: form,
      credentials: 'include'
    })
      .then(res => res.json())
      .then(x =>
        setData({
          ...obj,
          qrCode: x,
          imageName: '',
          imageDescription: '',
          imageLabelName: UPLOAD_LABEL_NAME,
          imageFiles: []
        })
      )
      .catch(_ =>
        errorContext.dispatchError({
          type: 'global',
          payload: 'Server error ocurred'
        })
      );
  };

  return (
    <>
      <input
        id="image-name"
        type="text"
        value={obj.imageName}
        name="image-name"
        placeholder={t('Image name')}
        className={
          obj.imageNameError ? 'error-input-container createInputLabel' : 'createInputLabel'
        }
        onChange={e =>
          setData({
            ...obj,
            imageName: e.target.value,
            imageNameError: false
          })
        }
      />
      <textarea
        id="image-description"
        name="image-description"
        value={obj.imageDescription}
        placeholder={t('Image description')}
        rows="20"
        cols="40"
        autoComplete="off"
        className={
          obj.imageDescriptionError ? 'error-input-container createTextArea' : 'createTextArea'
        }
        onChange={e =>
          setData({
            ...obj,
            imageDescription: e.target.value,
            imageDescriptionError: false
          })
        }
      ></textarea>
      <div className="input-wrapper">
        <div className={`input-group ${obj.imageFilesError && 'fileError'}`}>
          <div className="input-group-prepend">
            <span className="input-group-text" id="inputGroupFileAddon01">
              <i className="fas fa-upload"></i>
            </span>
          </div>
          <div className="custom-file">
            <input
              id="inputGroupFile01"
              type="file"
              name="image-file"
              accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg"
              onChange={e =>
                setData({
                  ...obj,
                  imageFiles: e.target.files,
                  imageFilesError: false,
                  imageLabelName: e.target.files[0].name || ''
                })
              }
            />
            <label className="custom-file-label" htmlFor="inputGroupFile01">
              {!!obj.imageLabelName ? obj.imageLabelName : UPLOAD_LABEL_NAME}
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-lg btn-primary btn-block text-uppercase mt-2 imgUploadButton"
        onClick={uploadContent}
      >
        {t('Submit')}
      </button>
      {obj.qrCode && (
        <div id="preview-mode">
          <h3 className="qr-code-message">
            {t('Your QR code was successfully stored to the database!')}
          </h3>
          <img id="qr-code" src={obj.qrCode} alt={obj.imageName} className="mx-auto d-block" />
        </div>
      )}
    </>
  );
}

export default CreateContent;
