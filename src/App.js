import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";

function App() {
  const [name, setName] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [chart, setChart] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("male");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let dataset =
          selectedDataset === "male" ? "male_names.csv" : "female_names.csv";
        const response = await fetch(`Ontario_baby_names/${dataset}`);
        const csvData = await response.text();
        const parsed = Papa.parse(csvData, { header: true }).data;
        setParsedData(parsed);
      } catch (error) {
        console.error("Error fetching or parsing data:", error);
      }
    };

    fetchData();
  }, [selectedDataset]);

  const addToChart = () => {
    if (!parsedData || parsedData.length === 0 || !name.trim()) {
      return;
    }

    if (selectedNames.includes(name)) {
      console.log("Name already added to chart");
      return;
    }

    const filteredResults = parsedData.filter(
      (row) => row["Name/Nom"] && row["Name/Nom"].trim() === name.toUpperCase()
    );

    if (filteredResults.length > 0) {
      const ctx = document.getElementById("frequencyChart");

      const newData = {
        label: `${name} Frequency`,
        data: filteredResults.map((result) => ({
          x: new Date(result["Year/Annee"]),
          y: result["Frequency/Frequence"],
        })),
        borderColor: getRandomColor(),
        backgroundColor: getRandomColor(),
        borderWidth: 1,
        fill: false,
      };

      if (!chart) {
        const newChart = new Chart(ctx, {
          type: "line",
          data: {
            datasets: [newData],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "year",
                },
                title: {
                  display: true,
                  text: "Year",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Frequency",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  title: () => "",
                  label: (context) => {
                    const value = context.parsed.y;
                    const date = new Date(context.parsed.x);
                    const year = date.getFullYear();
                    return `Year: ${year}, Frequency: ${value}`;
                  },
                },
              },
            },
          },
        });

        setChart(newChart);
        addToSelectedNames(name);
      } else {
        chart.data.datasets.push(newData);
        chart.update();
        addToSelectedNames(name);
      }
    } else {
      console.log("Name not found in data");
    }
  };

  const addToSelectedNames = (name) => {
    setSelectedNames([...selectedNames, name]);
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const toggleDataset = () => {
    setSelectedDataset((prevDataset) =>
      prevDataset === "male" ? "female" : "male"
    );
    setSelectedNames([]);
    if (chart) {
      chart.destroy();
      setChart(null);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <TextField
        id="standard-basic"
        label="Enter a name"
        variant="standard"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="contained" onClick={addToChart}>
        Add to Chart
      </Button>
      <div>
        <Switch checked={selectedDataset === "male"} onChange={toggleDataset} />
        <span>Show {selectedDataset === "male" ? "Male" : "Female"} Data</span>
      </div>
      <div>
        <p>Selected Names: {selectedNames.join(", ")}</p>
        <canvas id="frequencyChart" width="400" height="200"></canvas>
      </div>
    </div>
  );
}

export default App;
