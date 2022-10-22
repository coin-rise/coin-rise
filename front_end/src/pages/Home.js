import React, { useEffect, useState } from "react";

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setData(data);
        console.log(data);
      })
      .catch((error) => {
        console.log("Error fetching", error);
      });
  }, []);

  return (
    <div>
      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
      >
        {data.map((data) => (
          <div key={data.title}>
            <p>{data.title}</p>
            <img src={data.image} style={{ width: "100%" }}></img>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
