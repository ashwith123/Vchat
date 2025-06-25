import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8080/api"
      : "/api",
  withCredentials: true,
});

export default axiosInstance;

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     } else {
//       console.log("No token found in localStorage");
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // instead of writing this in every page we create an instance

// // // Without using axiosInstance, doing it on every request
// // axios.get('http://localhost:5001/api/user', {
// //   headers: {
// //     'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Adding token manually
// //   },
// // })
// // .then(response => {
// //   console.log(response.data);
// // })
// // .catch(error => {
// //   console.error(error);
// // });
