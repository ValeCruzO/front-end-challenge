import React, { useEffect, useState } from 'react';
import './App.css';

const FetchDatasetId = ({ onDatasetIdFetched }) => {
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://api.coxauto-interview.com/api/datasetId', {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Request error:', response);
        return;
      }

      const jsonData = await response.json();
      onDatasetIdFetched(jsonData.datasetId); // Invokes the callback function with the datasetId
    };

    fetchData().catch(console.error);
  }, [onDatasetIdFetched]);

  return null;
};

const FetchDataVehicles = ({ datasetId }) => {
  const [vehicleData, setVehicleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://api.coxauto-interview.com/api/${datasetId}/cheat`, { method: 'GET' });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let fullData = await response.json();
        if (!fullData.dealers || !Array.isArray(fullData.dealers)) {
          throw new Error('The "dealers" property was not found or is not an array in the JSON response.');
        }

        const vehiclesArray = fullData.dealers.flatMap(dealer => dealer.vehicles);

        if (Array.isArray(vehiclesArray)) {
          setVehicleData(vehiclesArray);
          setFilteredData(vehiclesArray); // Initializes filteredData with all the vehicles
        } else {
          console.error('vehiclesArray is not an array', vehiclesArray);
        }
      } catch (error) {
        console.error('Error retrieving the data:', error);
      }
    };

    fetchData();
  }, [datasetId]);

  const sortData = (key) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    setSortConfig({ key, direction: newDirection });

    setFilteredData(prevData => {
      let sortedData = [...prevData];
      sortedData.sort((a, b) => {
        if (a[key] < b[key]) {
          return newDirection === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return newDirection === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      return sortedData;
    });
  };

  useEffect(() => {
    const results = vehicleData.filter(vehicle =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm)
    );
    setFilteredData(results);
  }, [searchTerm, vehicleData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!vehicleData.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container'>
      <h1 className='titleName'>Vehicles</h1>
      <input
        className='searchBar'
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button onClick={handleClearSearch} className='buttonDelete'>Delete</button>
      <table className='tableVehicles'>
        <thead>
          <tr>
            <th onClick={() => sortData('year')}>Year</th>
            <th onClick={() => sortData('model')}>Model</th>
            <th onClick={() => sortData('make')}>Maker</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((vehicle, index) => (
            <tr key={index}>
              <td>{vehicle.year}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.make}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  );
};

function App() {
  const [datasetId, setDatasetId] = useState(null);

  return (
    <div className="App">
      <FetchDatasetId onDatasetIdFetched={setDatasetId} />
      {datasetId && <FetchDataVehicles datasetId={datasetId} />}
    </div>
  );
}

export default App;