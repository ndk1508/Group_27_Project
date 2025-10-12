import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:3000", // backend đang chạy ở port 3000
});
