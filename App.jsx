import React, { useState, useRef } from 'react';

// Helper to convert file to base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// UnitCard Component: Displays information for a single HVAC unit
const UnitCard = ({ unit, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUnit, setEditedUnit] = useState(unit);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const base64Images = await Promise.all(files.map(file => toBase64(file)));
        const newImages = [...editedUnit.images, ...base64Images];
        const updatedUnit = { ...editedUnit, images: newImages };
        setEditedUnit(updatedUnit);
        onUpdate(updatedUnit.id, updatedUnit);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUnit({ ...editedUnit, [name]: value });
    };

    const handleEconomizerChange = (e) => {
        setEditedUnit({ ...editedUnit, economizer: e.target.value === 'yes' });
    };
    
    const handleFilterChange = (index, event) => {
        const values = [...editedUnit.filters];
        values[index][event.target.name] = event.target.value;
        setEditedUnit({ ...editedUnit, filters: values });
    };

    const addFilterField = () => {
        const newFilters = [...(editedUnit.filters || []), { size: '', quantity: '' }];
        setEditedUnit({ ...editedUnit, filters: newFilters });
    };

    const removeFilterField = (index) => {
        const values = [...editedUnit.filters];
        values.splice(index, 1);
        setEditedUnit({ ...editedUnit, filters: values });
    };

    const handleSaveChanges = () => {
        // Filter out empty filter rows before saving
        const finalFilters = editedUnit.filters.filter(f => f.size && f.quantity);
        onUpdate(editedUnit.id, {...editedUnit, filters: finalFilters});
        setIsEditing(false);
    };

    const handleRemoveImage = (index) => {
        const newImages = editedUnit.images.filter((_, i) => i !== index);
        const updatedUnit = { ...editedUnit, images: newImages };
        setEditedUnit(updatedUnit);
        onUpdate(updatedUnit.id, updatedUnit);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
            {!isEditing ? (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Unit: {unit.location}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                        <p><strong className="font-semibold">Area Served:</strong> {unit.areaServed}</p>
                        <p><strong className="font-semibold">Model #:</strong> {unit.modelNumber}</p>
                        <p><strong className="font-semibold">Serial #:</strong> {unit.serialNumber}</p>
                        <p><strong className="font-semibold">Drive Type:</strong> {unit.driveType === 'dd' ? 'Direct Drive' : 'Belt Drive'}</p>
                        <p><strong className="font-semibold">Economizer:</strong> {unit.economizer ? 'Yes' : 'No'}</p>
                    </div>
                    {unit.filters && unit.filters.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-700">Filters:</h4>
                            <ul className="list-disc list-inside">
                                {unit.filters.map((filter, index) => (
                                    <li key={index}>{filter.quantity}x - {filter.size}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {unit.images.map((image, index) => (
                            <div key={index} className="relative">
                                <img src={image} alt={`Unit ${index + 1}`} className="rounded-md object-cover w-full h-32" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                         <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">Edit</button>
                         <button onClick={() => onDelete(unit.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Delete</button>
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Editing Unit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="location" value={editedUnit.location} onChange={handleInputChange} placeholder="Unit Location" className="p-2 border rounded-md" />
                        <input type="text" name="areaServed" value={editedUnit.areaServed} onChange={handleInputChange} placeholder="Area Served" className="p-2 border rounded-md" />
                        <input type="text" name="modelNumber" value={editedUnit.modelNumber} onChange={handleInputChange} placeholder="Model Number" className="p-2 border rounded-md" />
                        <input type="text" name="serialNumber" value={editedUnit.serialNumber} onChange={handleInputChange} placeholder="Serial Number" className="p-2 border rounded-md" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Drive Type</label>
                            <select name="driveType" value={editedUnit.driveType} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="belt">Belt Drive</option>
                                <option value="dd">Direct Drive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Economizer</label>
                            <div className="flex items-center space-x-4 mt-1">
                                <label><input type="radio" value="yes" checked={editedUnit.economizer === true} onChange={handleEconomizerChange} className="mr-1"/>Yes</label>
                                <label><input type="radio" value="no" checked={editedUnit.economizer === false} onChange={handleEconomizerChange} className="mr-1"/>No</label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Filters</h4>
                        {editedUnit.filters.map((filter, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input type="text" name="size" value={filter.size} onChange={e => handleFilterChange(index, e)} placeholder="Filter Size (e.g., 20x20x1)" className="p-2 border rounded-md w-1/2" />
                                <input type="number" name="quantity" value={filter.quantity} onChange={e => handleFilterChange(index, e)} placeholder="Qty" className="p-2 border rounded-md w-1/4" />
                                <button onClick={() => removeFilterField(index)} className="px-3 py-2 bg-red-500 text-white rounded-md">&times;</button>
                            </div>
                        ))}
                        <button onClick={addFilterField} className="text-sm text-blue-500 hover:underline">+ Add Filter</button>
                    </div>
                     <div className="mt-4">
                        <button onClick={() => fileInputRef.current.click()} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Add Images</button>
                        <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {editedUnit.images.map((image, index) => (
                            <div key={index} className="relative">
                                <img src={image} alt={`Unit ${index + 1}`} className="rounded-md object-cover w-full h-32" />
                                <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">&times;</button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveChanges} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// UnitForm Component: Form to add a new HVAC unit
const UnitForm = ({ onAddUnit }) => {
    const [location, setLocation] = useState('');
    const [areaServed, setAreaServed] = useState('');
    const [modelNumber, setModelNumber] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [images, setImages] = useState([]);
    const [filters, setFilters] = useState([{ size: '', quantity: '' }]);
    const [driveType, setDriveType] = useState('belt');
    const [economizer, setEconomizer] = useState('no');
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const base64Images = await Promise.all(files.map(file => toBase64(file)));
        setImages([...images, ...base64Images]);
    };

    const handleFilterChange = (index, event) => {
        const values = [...filters];
        values[index][event.target.name] = event.target.value;
        setFilters(values);
    };

    const addFilterField = () => {
        setFilters([...filters, { size: '', quantity: '' }]);
    };

    const removeFilterField = (index) => {
        const values = [...filters];
        values.splice(index, 1);
        setFilters(values);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!location) {
            alert("Please provide a location for the unit.");
            return;
        }
        const finalFilters = filters.filter(f => f.size && f.quantity);
        onAddUnit({ id: Date.now(), location, areaServed, modelNumber, serialNumber, images, filters: finalFilters, driveType, economizer: economizer === 'yes' });
        setLocation('');
        setAreaServed('');
        setModelNumber('');
        setSerialNumber('');
        setImages([]);
        setFilters([{ size: '', quantity: '' }]);
        setDriveType('belt');
        setEconomizer('no');
    };
    
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New HVAC Unit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Unit Location (e.g., Rooftop 1)" value={location} onChange={(e) => setLocation(e.target.value)} className="p-3 border rounded-lg" required />
                    <input type="text" placeholder="Area Served (e.g., Office)" value={areaServed} onChange={(e) => setAreaServed(e.target.value)} className="p-3 border rounded-lg" />
                    <input type="text" placeholder="Model Number" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} className="p-3 border rounded-lg" />
                    <input type="text" placeholder="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="p-3 border rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Drive Type</label>
                        <select value={driveType} onChange={(e) => setDriveType(e.target.value)} className="mt-1 block w-full p-3 border rounded-lg">
                            <option value="belt">Belt Drive</option>
                            <option value="dd">Direct Drive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Economizer</label>
                        <div className="flex items-center space-x-4 mt-2 p-3">
                            <label><input type="radio" value="yes" checked={economizer === 'yes'} onChange={(e) => setEconomizer(e.target.value)} className="mr-1"/>Yes</label>
                            <label><input type="radio" value="no" checked={economizer === 'no'} onChange={(e) => setEconomizer(e.target.value)} className="mr-1"/>No</label>
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
                    {filters.map((filter, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" name="size" value={filter.size} onChange={e => handleFilterChange(index, e)} placeholder="Filter Size (e.g., 20x20x1)" className="p-3 border rounded-lg w-full md:w-1/2" />
                            <input type="number" name="quantity" value={filter.quantity} onChange={e => handleFilterChange(index, e)} placeholder="Qty" className="p-3 border rounded-lg w-full md:w-1/4" />
                            <button type="button" onClick={() => removeFilterField(index)} className="px-3 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300">-</button>
                        </div>
                    ))}
                    <button type="button" onClick={addFilterField} className="mt-1 text-sm text-blue-600 hover:underline">+ Add another filter size</button>
                </div>
                <div>
                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Upload Pictures</button>
                    <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((image, index) => (
                       <div key={index} className="relative">
                           <img src={image} alt={`upload-preview ${index}`} className="rounded-md object-cover w-full h-32" />
                           <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none">&times;</button>
                       </div>
                    ))}
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Add Unit</button>
            </form>
        </div>
    );
};

// ServiceReport Component: Displays the final report
const ServiceReport = ({ units, clientInfo }) => {
    return (
        <div id="service-report" className="p-8 bg-white">
            <header className="text-center mb-8 border-b-2 pb-4 border-gray-300">
                <h1 className="text-4xl font-extrabold text-gray-800">HVAC Service Report</h1>
                <p className="text-lg text-gray-600 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </header>
            
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Client Information</h2>
                <p><strong className="font-semibold">Client Name:</strong> {clientInfo.name}</p>
                <p><strong className="font-semibold">Address:</strong> {clientInfo.address}</p>
            </div>

            {units.map(unit => (
                <div key={unit.id} className="mb-10 break-inside-avoid">
                    <h3 className="text-2xl font-bold text-blue-600 bg-gray-100 p-3 rounded-t-lg border-l-4 border-blue-600">Unit: {unit.location}</h3>
                    <div className="border p-4 rounded-b-lg">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><strong className="font-semibold">Area Served:</strong> {unit.areaServed}</div>
                            <div><strong className="font-semibold">Model #:</strong> {unit.modelNumber}</div>
                            <div><strong className="font-semibold">Serial #:</strong> {unit.serialNumber}</div>
                            <div><strong className="font-semibold">Drive Type:</strong> {unit.driveType === 'dd' ? 'Direct Drive' : 'Belt Drive'}</div>
                            <div><strong className="font-semibold">Economizer:</strong> {unit.economizer ? 'Yes' : 'No'}</div>
                        </div>
                        {unit.filters && unit.filters.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-700">Filters:</h4>
                                <ul className="list-disc list-inside">
                                    {unit.filters.map((filter, index) => (
                                        <li key={index}>{filter.quantity}x - {filter.size}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <h4 className="text-xl font-semibold mt-6 mb-4 text-gray-700">Maintenance Photos</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {unit.images.map((image, index) => (
                                <div key={index} className="break-inside-avoid">
                                    <img src={image} alt={`Unit ${unit.location} - ${index + 1}`} className="rounded-lg shadow-md w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
             <footer className="text-center mt-10 pt-4 border-t-2 border-gray-300 text-sm text-gray-500">
                <p>Thank you for your business.</p>
                <p>Generated by HVAC Service Reporter</p>
            </footer>
        </div>
    );
};


// Main App Component
export default function App() {
    const [units, setUnits] = useState([]);
    const [clientInfo, setClientInfo] = useState({ name: '', address: '' });
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef();

    const addUnit = (unit) => {
        setUnits([...units, unit]);
    };

    const updateUnit = (id, updatedUnit) => {
        setUnits(units.map(unit => (unit.id === id ? updatedUnit : unit)));
    };

    const deleteUnit = (id) => {
        setUnits(units.filter(unit => unit.id !== id));
    };
    
    const handleClientInfoChange = (e) => {
        const { name, value } = e.target;
        setClientInfo(prev => ({...prev, [name]: value}));
    }

    const generatePdf = () => {
        setIsGeneratingPdf(true);
        const input = document.getElementById('service-report');
        // Access html2canvas and jsPDF from the window object
        const html2canvas = window.html2canvas;
        const { jsPDF } = window.jspdf;

        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth;
            const imgHeight = imgWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            pdf.save("hvac-service-report.pdf");
            setIsGeneratingPdf(false);
        }).catch(err => {
            console.error("Error generating PDF", err);
            setIsGeneratingPdf(false);
        });
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">HVAC Service Reporter</h1>
                    <p className="text-lg text-gray-600 mt-2">Easily document unit maintenance and generate PDF reports.</p>
                </header>
                
                <div className="bg-white p-8 rounded-xl shadow-2xl mb-8 border border-gray-200">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">Client Information</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Client Name" value={clientInfo.name} onChange={handleClientInfoChange} className="p-3 border rounded-lg" />
                        <input type="text" name="address" placeholder="Client Address" value={clientInfo.address} onChange={handleClientInfoChange} className="p-3 border rounded-lg" />
                     </div>
                </div>

                <UnitForm onAddUnit={addUnit} />

                <div className="my-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2">Service Units</h2>
                    {units.length === 0 ? (
                        <p className="text-center text-gray-500">No units added yet. Use the form above to add one.</p>
                    ) : (
                        units.map(unit => (
                            <UnitCard key={unit.id} unit={unit} onUpdate={updateUnit} onDelete={deleteUnit} />
                        ))
                    )}
                </div>

                {units.length > 0 && (
                    <div className="text-center my-10">
                        <button onClick={generatePdf} disabled={isGeneratingPdf} className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-gray-400">
                            {isGeneratingPdf ? 'Generating PDF...' : 'Generate Full Service Report (PDF)'}
                        </button>
                    </div>
                )}
                
                {/* Hidden report for PDF generation */}
                <div className="absolute -left-full -top-full opacity-0">
                    <div ref={reportRef}>
                       <ServiceReport units={units} clientInfo={clientInfo} />
                    </div>
                </div>
            </div>
        </div>
    );
}
