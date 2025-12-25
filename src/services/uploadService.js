import { fetchData } from ".";

const PATH = "/api";

export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetchData(
    `${PATH}/upload/`,
    "POST",
    formData,
    "multipart/form-data"
  );

  
  if (!res?.success) throw res;

  return res;
}
