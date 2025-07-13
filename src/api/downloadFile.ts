import axiosClient from "../services/axiosClient";

export const downloadFileExApi = () =>
    axiosClient.get('/download/pnl-log', { responseType: 'blob' }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        // Lấy filename từ header nếu có
        const disposition = response.headers['content-disposition'];
        const filename = disposition
            ? disposition.split('filename=')[1]?.replace(/"/g, '') || "pnl_log.xlsx"
            : "pnl_log.xlsx";

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

