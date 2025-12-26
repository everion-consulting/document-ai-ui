import { fetchData } from ".";

const PATH = "/api/analysis";

export const apiService = {
  // ✅ POST /api/analysis/upload/  (FormData)
  async uploadDocuments(files) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f)); // backend getlist('files')
    return await fetchData(
      `${PATH}/upload/`,
      "POST",
      formData,
      "multipart/form-data"
    );
  },

  // ✅ GET /api/analysis/documents/?doc_type=&status=&search=
  async listDocuments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${PATH}/documents/${qs ? `?${qs}` : ""}`;
    return await fetchData(url, "GET");
  },

  // ✅ GET /api/analysis/documents/:id/
  async getDocument(id) {
    return await fetchData(`${PATH}/documents/${id}/`, "GET");
  },

  // ✅ GET /api/analysis/stats/
  async getStats() {
    return await fetchData(`${PATH}/stats/`, "GET");
  },

  // ✅ POST /api/analysis/documents/:id/reprocess/
  async reprocessDocument(id) {
    return await fetchData(`${PATH}/documents/${id}/reprocess/`, "POST");
  },

  // ✅ DELETE /api/analysis/documents/:id/delete/
  async deleteDocument(id) {
    return await fetchData(`${PATH}/documents/${id}/delete/`, "DELETE");
  },
};

export default apiService;
