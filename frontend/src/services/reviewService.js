import axios from "../core/api/axiosInstance";

const reviewService = {
  create:         (payload)       => axios.post("/reviews", payload).then((r) => r.data),
  getAll:         ()              => axios.get("/reviews").then((r) => r.data),
  count:          ()              => axios.get("/reviews/count").then((r) => r.data),
  getMyReviews:   ()              => axios.get("/reviews/my-reviews").then((r) => r.data),
  getById:        (id)            => axios.get(`/reviews/${id}`).then((r) => r.data),
  getByType:      (type)          => axios.get(`/reviews/type/${type}`).then((r) => r.data),
  getByTypeAndId: (type, reviewId) => axios.get(`/reviews/type/${type}/${reviewId}`).then((r) => r.data),
  update:         (id, payload)   => axios.put(`/reviews/${id}`, payload).then((r) => r.data),
  delete:         (id)            => axios.delete(`/reviews/${id}`).then((r) => r.data),
};

export default reviewService;
