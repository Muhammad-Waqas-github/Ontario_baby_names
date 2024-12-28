import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import { colors, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CanadaFlag from "./canada-flag.svg";
import UsaFlag from "./usa-flag.svg";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
function App() {
  const [name, setName] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [chart, setChart] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]);
  const [country, setCountry] = useState("Canada");
  const [parsedDataCanada, setParsedDataCanada] = useState([]);
  const [parsedDataUSA, setParsedDataUSA] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [loadingCanadianDatasets, setLoadingCanadianDatasets] = useState(false);
  const [loadingUSADatasets, setLoadingUSADatasets] = useState(false);

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
  };
  useEffect(() => {
    if (country === "Canada") {
      setParsedData(parsedDataCanada);
    } else if (country === "USA") {
      setParsedData(parsedDataUSA);
    }

    if (chart && selectedNames.length > 0) {
      // Clear existing datasets
      chart.data.datasets = [];

      // Add datasets for selected names from the new country's data
      selectedNames.forEach((name) => {
        const filteredResults = (
          country === "Canada" ? parsedDataCanada : parsedDataUSA
        ).filter(
          (row) => row["Name"] && row["Name"].trim() === name.toUpperCase()
        );

        if (filteredResults.length > 0) {
          const newData = {
            label: `${name} Frequency`,
            data: filteredResults.map((result) => ({
              x: new Date(result["Year"]),
              y: result["Frequency"],
            })),
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor(),
            borderWidth: 1,
            fill: false,
          };

          chart.data.datasets.push(newData);
        }
      });

      // Update the chart to reflect changes
      chart.update();
    }
  }, [country, parsedDataCanada, parsedDataUSA, chart, selectedNames]);
  const removeNameFromChart = (nameToRemove) => {
    // Remove from selectedNames
    setSelectedNames((prevSelectedNames) =>
      prevSelectedNames.filter((name) => name !== nameToRemove)
    );

    // Remove the dataset from the chart
    if (chart) {
      const updatedDatasets = chart.data.datasets.filter(
        (dataset) => dataset.label !== `${nameToRemove} Frequency`
      );
      chart.data.datasets = updatedDatasets;
      chart.update();
    }

    // Remove the name from tableData
    setTableData((prevTableData) => {
      const newTableData = { ...prevTableData };
      delete newTableData[nameToRemove];
      return newTableData;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = document.getElementById("frequencyChart");
      canvas.width = window.innerWidth * 0.8; // 80% of window width
      canvas.height = window.innerHeight * 0.3; // 30% of window height
      if (chart) {
        chart.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chart]);

  useEffect(() => {
    setLoadingDatasets(true);
    setLoadingCanadianDatasets(true);

    const fetchDataCanada = async () => {
      try {
        // const response = await fetch("Ontario_baby_names/canada_names.csv");
        const response = await fetch("canada_names.csv");
        const csvData = await response.text();
        const parsed = Papa.parse(csvData, { header: true }).data;
        setParsedDataCanada(parsed);
      } catch (error) {
        console.error("Error fetching or parsing Canada data:", error);
      } finally {
        setLoadingCanadianDatasets(false);
      }
    };

    const fetchDataUSA = async () => {
      setLoadingUSADatasets(true);
      try {
        // const response = await fetch("Ontario_baby_names/usa_names.csv");
        const response = await fetch("usa_names.csv");
        const csvData = await response.text();
        const parsed = Papa.parse(csvData, { header: true }).data;
        setParsedDataUSA(parsed);
      } catch (error) {
        console.error("Error fetching or parsing USA data:", error);
      } finally {
        setLoadingUSADatasets(false);
      }
    };

    Promise.all([fetchDataCanada(), fetchDataUSA()]).then(() => {
      setLoadingDatasets(false);
    });
  }, []);
  useEffect(() => {
    setLoadingDatasets(loadingCanadianDatasets || loadingUSADatasets);
  }, [loadingCanadianDatasets, loadingUSADatasets]);
  useEffect(() => {
    if (country === "Canada") {
      setParsedData(parsedDataCanada);
    } else if (country === "USA") {
      setParsedData(parsedDataUSA);
    }
  }, [country, parsedDataCanada, parsedDataUSA]);

  const addToChart = () => {
    if (!parsedData || parsedData.length === 0 || !name.trim()) {
      return;
    }

    if (selectedNames.includes(name)) {
      console.log("Name already added to chart");
      return;
    }

    const filteredResults = parsedData.filter(
      (row) => row["Name"] && row["Name"].trim() === name.toUpperCase()
    );

    if (filteredResults.length > 0) {
      const ctx = document.getElementById("frequencyChart");

      const newData = {
        label: `${name} Frequency`,
        data: filteredResults.map((result) => ({
          x: new Date(result["Year"]),
          y: result["Frequency"],
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
                    date.setMonth(date.getMonth() + 1); // Add 1 to the month
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
  const getEarliestAndLatestYears = (tableData) => {
    const years = [];
    Object.keys(tableData).forEach((name) => {
      tableData[name].forEach((row) => {
        years.push(parseInt(row["Year"]));
      });
    });
    return Array.from(new Set(years)).sort((a, b) => a - b);
  };

  const getFrequencyForYear = (data, year) => {
    const row = data.find((item) => item["Year"] === year.toString());
    return row ? row["Frequency"] : "";
  };

  const [tableData, setTableData] = useState({});

  const addToTable = (name) => {
    if (!parsedData || parsedData.length === 0 || !name.trim()) {
      return;
    }

    const filteredResults = parsedData.filter(
      (row) => row["Name"] && row["Name"].trim() === name.toUpperCase()
    );

    if (filteredResults.length > 0) {
      setTableData((prevData) => ({ ...prevData, [name]: filteredResults }));
    } else {
      console.log("Name not found in data");
    }
  };

  useEffect(() => {
    if (selectedNames.length > 0) {
      selectedNames.forEach((name) => addToTable(name));
    }
  }, [selectedNames, parsedData]);
  return (
    <div
      style={{
        margin: "20px",
      }}
    >
      {loadingDatasets && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <p>
            Loading
            {loadingUSADatasets && loadingCanadianDatasets
              ? " USA and Canada "
              : loadingUSADatasets
              ? " USA "
              : loadingCanadianDatasets
              ? " Canadian "
              : ""}
            Datasets, Please wait...
          </p>
        </Box>
      )}
      <div style={loadingDatasets ? { display: "none" } : {}}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", md: "2.5rem" },
            fontWeight: 600,
            color: "#1976d2", // primary color
            textTransform: "none",
            textAlign: "center",
            mb: 2,
          }}
        >
          Is Your Name Popular?
        </Typography>
        <div style={{ display: "flex", gap: 16 }}>
          <Button
            variant={country === "Canada" ? "contained" : "outlined"}
            color="error"
            onClick={() => handleCountryChange("Canada")}
          >
            Canada
          </Button>

          <Button
            variant={country === "USA" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleCountryChange("USA")}
          >
            USA
          </Button>
        </div>
        <div className="flag-container">
          <img
            src={country === "Canada" ? CanadaFlag : UsaFlag}
            alt={country === "Canada" ? "Canada Flag" : "USA Flag"}
            className="flag"
          />
          <div className="light-effect"></div>
        </div>
        <p>Selected Country: {country}</p>
        <TextField
          id="standard-basic"
          label="Enter a name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button sx={{ marginLeft: 4 }} variant="contained" onClick={addToChart}>
          Add to Chart
        </Button>

        <div>
          <p>Selected Names:</p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {selectedNames.map((name, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ marginRight: 8 }}>{name}</span>
                <button
                  onClick={() => removeNameFromChart(name)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "red",
                    fontSize: "16px",
                  }}
                  aria-label={`Remove ${name}`}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          <canvas id="frequencyChart"></canvas>
        </div>

        {Object.keys(tableData).length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            <Table sx={{ width: "max-content" }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  {Object.keys(tableData).map((name) => (
                    <TableCell key={name} align="right">
                      {name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(tableData).length > 0 &&
                  getEarliestAndLatestYears(tableData).map((year) => (
                    <TableRow
                      key={year}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {year}
                      </TableCell>
                      {Object.keys(tableData).map((name) => (
                        <TableCell key={name} align="right">
                          {getFrequencyForYear(tableData[name], year)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Typography
          variant="body2"
          component="p"
          sx={{
            fontSize: ".75rem",
            fontWeight: 400,
            color: "#666", // neutral color
            textTransform: "none",
            textAlign: "center",
            mt: 4,
            pb: 2,
          }}
        >
          &copy; {new Date().getFullYear()} Muhammad Waqas. All Rights Reserved.{" "}
          <br />
          The data represented herein pertains to baby names registered in
          Canada and USA till 2024, excluding names registered five times or
          less. This data is provided for informational purposes only and does
          not constitute official records or endorsement.
        </Typography>
      </div>{" "}
    </div>
  );
}

export default App;
