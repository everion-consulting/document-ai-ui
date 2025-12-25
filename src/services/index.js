
const API_BASE_URL = "https://dosya-bildirim-vrosq.ondigitalocean.app";

const PROTECTED_ENDPOINTS = ['/api/', '/core/'];

export async function fetchData(
  endpoint,
  method = "GET",
  body = null,
  contentType = "application/json"
) {
  try {
    const token = localStorage.getItem("authToken");
    
    const isProtected = PROTECTED_ENDPOINTS.some(prefix => endpoint.startsWith(prefix));
    if (isProtected && (!token || token === "undefined" || token === "null")) {
      return {
        success: false,
        status: 401,
        message: "",
        data: [],
      };
    }

    const headers = {
      Accept: "application/json",
      ...(contentType !== "multipart/form-data" && {
        "Content-Type": contentType,
      }),
      ...(token && { Authorization: `Token ${token}` }),
    };

    const options = {
      method,
      headers,
      ...(body &&
        contentType === "application/json" && {
        body: JSON.stringify(body),
      }),
      ...(body && contentType === "multipart/form-data" && { body }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      console.log("⚠️ API Error:", response.status, `${API_BASE_URL}${endpoint}`);
    }


    const contentTypeResp = response.headers.get("content-type");
    const data = contentTypeResp?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      success: response.ok,
      status: response.status,
      message:
        data?.detail || data?.message || (typeof data === "string" ? data : response.statusText),
      data,
    };
  } catch (err) {
    console.error("Fetch hata:", err);
    return {
      success: false,
      message: err.message,
      data: null,
    };
  }
}
