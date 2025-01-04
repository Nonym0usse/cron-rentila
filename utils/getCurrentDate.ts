export function getCurrentDate(month: string) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const day = String(today.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${day}-${month}`;
}

export function mailOptions(attachments: { filename: string, path: string }[]) {
    return {
        from: process.env.FROM || "",
        to: process.env.TO || "",
        subject: 'Quittances',
        text: 'Merci de trouver ci-joint les quittances.',
        attachments
    }
};