import { useState } from 'react';
import Img1 from './assets/i1.jpeg';
import Img2 from './assets/i2.jpeg';
import Navbar from './components/Navbar';
import { Upload } from "lucide-react";
import './index.css';

function App() {
  // State for our beautiful app
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle our romantic theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Structure the AI's loving response
  const structureResponse = (text) => {
    if (!text) return [];
    
    // Split into sections with cute headings
    const sections = text.split('\n\n').filter(section => section.trim() !== '');
    return sections.map(section => {
      const isHeading = section.startsWith('**') && section.endsWith('**');
      return {
        type: isHeading ? 'heading' : 'paragraph',
        content: isHeading ? section.slice(2, -2) : section
      };
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return alert("Select a file first, my darling~");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/uploadHandler", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setUploadedUrl(data.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRoast = async () => {
    if (!uploadedUrl) {
      alert("Please upload a file first, my love~");
      return;
    }
  
    setIsRoasting(true);
    setRoastResult([]);
  
    try {
      let response = await fetch("http://localhost:5000/api/roast-resume", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl: uploadedUrl })
      });

      if (response.status === 403) {
        const refreshResponse = await fetch("http://localhost:5000/api/refresh-url", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalUrl: uploadedUrl })
        });
        
        const { newUrl } = await refreshResponse.json();
        setUploadedUrl(newUrl);
        
        response = await fetch("http://localhost:5000/api/roast-resume", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfUrl: newUrl })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Roasting failed');
      }
      
      const data = await response.json();
      setRoastResult(structureResponse(data.roast));
    } catch (error) {
      console.error("Roasting failed:", error);
      alert(`Roasting failed: ${error.message}`);
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark-theme' : ''}`}>
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="container">
        <div className="box">
          <img src={darkMode ? Img2 : Img1} alt="Studio Ghibli" />
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx" 
            disabled={isUploading || isRoasting}
          />
          <div className="button-box">
            <button 
              onClick={uploadFile} 
              className='upload'
              disabled={isUploading || isRoasting || !file}
            >
              <Upload size={20} />
            </button>
            <button 
              className='roaster' 
              onClick={handleRoast}
              disabled={isRoasting || isUploading || !uploadedUrl}
            >
              {isRoasting ? 'Roasting...' : 'Roast'}
            </button>
          </div>
          
          {uploadedUrl && (
            <p className="uploaded-link">
              Uploaded: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View File</a>
            </p>
          )}

          {roastResult.length > 0 && (
            <div className="roast-result">
              <h3> Your Personalized Roast </h3>
              <div className="roast-content">
                {roastResult.map((item, index) => (
                  item.type === 'heading' ? (
                    <h4 key={index} className="roast-heading">{item.content}</h4>
                  ) : (
                    <p key={index} className="roast-paragraph">{item.content}</p>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;