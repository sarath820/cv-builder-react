import { useState } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [visible, setVisible] = useState("none");
  const buttonarray = ["personal", "education", "experience", "skills"];
  const inputarray = [
    ["name", "email", "phone"],
    ["university or school", "duration", "percentage or CGPA"],
    ["company", "duration", "job role"],
    []
  ];

  const [inputValues, setInputValues] = useState({
    personal: { name: "", email: "", phone: "" },
    education: [{ "university or school": "", duration: "", "percentage or CGPA": "" }],
    experience: [{ company: "", duration: "", jobrole: "" }],
    skills: { text: "" }
  });

  function personalClick(index) {
    setVisible(visible === index ? "none" : index);
  }

  function handleInputChange(section, index, inputName, value) {
    setInputValues((prevValues) => {
      if (Array.isArray(prevValues[section])) {
        const updatedSection = [...prevValues[section]];
        updatedSection[index][inputName] = value;
        return { ...prevValues, [section]: updatedSection };
      }
      return {
        ...prevValues,
        [section]: {
          ...prevValues[section],
          [inputName]: value
        }
      };
    });
  }

  function addSection(section) {
    setInputValues((prevValues) => ({
      ...prevValues,
      [section]: [
        ...prevValues[section],
        section === 'education'
          ? { "university or school": "", duration: "", "percentage or CGPA": "" }
          : { company: "", duration: "", jobrole: "" }
      ]
    }));
  }

  function deleteSection(section, index) {
    setInputValues((prevValues) => {
      const updatedSection = prevValues[section].filter((_, entryIndex) => entryIndex !== index);
      return { ...prevValues, [section]: updatedSection };
    });
  }

  const sectionOrder = ["personal", "education", "experience", "skills"];

  // Function to download CV as PDF
  const downloadPDF = () => {
    const input = document.getElementById('pdf-content'); // Get the CV content
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('cv.pdf'); // Trigger the PDF download
    });
  };

  return (
    <div className="app-container">
      <div className="main-container">
        <div className="input-side">
          {buttonarray.map((item, index) => (
            <div key={index} className="input-card">
              <h2>
                {item}
                <img onClick={() => personalClick(index)} className={visible === index ? "rotated" : ""} src="/down-arrow.png" style={{ width: '1em', height: '1em', verticalAlign: "middle", cursor: 'pointer' }} />
              </h2>

              <div style={{ display: visible === index ? "flex" : "none", flexDirection: 'column', gap: '15px' }} className='input-container'>
                {item === "skills" ? (
                  <textarea
                    placeholder="Enter your skills"
                    className="input-box"
                    value={inputValues.skills.text || ""}
                    onChange={(e) => handleInputChange("skills", null, "text", e.target.value)}
                    rows={4}
                  />
                ) : Array.isArray(inputValues[item]) ? (
                  inputValues[item].map((entry, entryIndex) => (
                    <div key={entryIndex}>
                      {inputarray[index].map((input, inputIndex) => (
                        <input
                          key={`${item}-${entryIndex}-${inputIndex}`}
                          type='text'
                          placeholder={input}
                          className='input-box'
                          value={inputValues[item][entryIndex][input] || ""}
                          onChange={(e) => handleInputChange(item, entryIndex, input, e.target.value)}
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  inputarray[index].map((input, inputIndex) => (
                    <input
                      key={inputIndex}
                      type='text'
                      placeholder={input}
                      className='input-box'
                      value={inputValues[item]?.[input] || ""}
                      onChange={(e) => handleInputChange(item, null, input, e.target.value)}
                    />
                  ))
                )}
              </div>

              {["education", "experience"].includes(item) && (
                <div className="button-container">
                  <button className="add-button" onClick={() => addSection(item)}>
                    Add {item} Section
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteSection(item, inputValues[item].length - 1)}
                    disabled={inputValues[item].length === 0}
                  >
                    Delete {item} Section
                  </button>
                </div>
              )}
            </div>
          ))}

        <div className="pdf-download-container">
        <button className="download-button" onClick={downloadPDF}>
          Download as PDF
        </button>
        </div>
        </div>

        <div className="output-side">
          <div className="paper-layout" id="pdf-content"> {/* Add id="pdf-content" for PDF generation */}
            {sectionOrder.map((sectionKey, sectionIndex) => (
              <div key={sectionKey}>
                {sectionKey === "personal" ? (
                  <div className="personal-preview">
                    <div className='heading'>{sectionKey === "personal" ? "" : sectionKey}</div>
                    <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {inputValues.personal.name || "name"}
                    </p>
                    <div className="email-phone-row">
                      <p style={{ textAlign: 'left' }}>
                        {inputValues.personal.email || "email"}
                      </p>
                      <p style={{ textAlign: 'right' }}>
                        {inputValues.personal.phone || "phone"}
                      </p>
                    </div>
                  </div>
                ) : Array.isArray(inputValues[sectionKey]) ? (
                  <>
                    <div className='heading'>{sectionKey}</div>
                    {inputValues[sectionKey].map((entry, entryIndex) => (
                      <div key={entryIndex}>
                        {Object.keys(entry).map((inputKey, inputKeyIndex) => (
                          <p key={inputKey} style={{ fontWeight: inputKeyIndex === 0 ? 'bold' : 'normal' }}>
                            {entry[inputKey] || inputarray[sectionIndex][inputKeyIndex]}
                          </p>
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className='heading'>{sectionKey}</div>
                    {Object.keys(inputValues[sectionKey]).map((inputKey, inputKeyIndex) => (
                      <p key={inputKey} style={{ fontWeight: inputKeyIndex === 0 ? 'bold' : 'normal' }}>
                        {inputValues[sectionKey][inputKey] || inputarray[sectionIndex][inputKeyIndex]}
                      </p>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
      </div>

      
    </div>
  );
}

export default App;
