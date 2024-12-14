"use client";
import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

interface Props {}
const Page = (props: Props) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [redactedImage, setRedactedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setRedactedImage(null);
        setError("");
      }
    },
  });

  const handleRedact = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/redactImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      setRedactedImage(response.data.file_url);
    } catch (err) {
      console.error(err);
      setError("Failed to redact the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1>Image Redaction</h1>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        <input {...getInputProps()} />
        <p>
          {image ? "Replace Image" : "Drag & Drop an Image or Click to Upload"}
        </p>
      </div>
      <div className="flex justify-between">
        <div>
          {preview && (
            <div>
              <h3 className="mb-5">Preview</h3>
              <img
                src={preview}
                alt="Uploaded Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginBottom: "20px",
                }}
              />
            </div>
          )}

          <button
            onClick={handleRedact}
            style={{
              background: "#0070f3",
              color: "white",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              fontSize: "16px",
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Redact Image"}
          </button>
        </div>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        {redactedImage && (
          <div className="">
            <h3 className="mb-5">Redacted Image</h3>
            <img
              src={`${redactedImage}`}
              alt="Redacted"
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
            <a
              onClick={() => {
                alert("The download will be redirected");
              }}
              href={`${redactedImage}`}
              download="redacted_image.jpg"
              style={{
                display: "block",
                marginTop: "10px",
                color: "#0070f3",
                textDecoration: "none",
              }}
            >
              Download Redacted Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
