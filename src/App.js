import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
function App() {
  const [name, setName] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [chart, setChart] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]);

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
    const fetchData = async () => {
      try {
        // const response = await fetch("names.csv");
        const response = await fetch(`Ontario_baby_names/${"names.csv"}`);
        const csvData = await response.text();
        const parsed = Papa.parse(csvData, { header: true }).data;
        setParsedData(parsed);
      } catch (error) {
        console.error("Error fetching or parsing data:", error);
      }
    };

    fetchData();
  }, []);

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
    <div style={{ margin: "20px" }}>
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
        Is My Name Popular?
      </Typography>
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
        <p>Selected Names: {selectedNames.join(", ")}</p>
        <canvas id="frequencyChart"></canvas>
      </div>
      {Object.keys(tableData).length > 0 && (
        <TableContainer component={Paper}>
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
        The data represented herein pertains to baby names registered in Ontario
        till 2019, excluding names registered five times or less. This data is
        provided for informational purposes only and does not constitute
        official records or endorsement.
      </Typography>
    </div>
  );
}

export default App;
