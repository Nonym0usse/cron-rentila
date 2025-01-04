import fs from "fs";
import unzipper from "unzipper";
import path from "path";
import { chromium } from "playwright";
import { getCurrentDate } from "./utils/getCurrentDate";
import { handleExtraction } from "./email/config";

const COOKIE_PATH = "./cookies.json";
const email = process.env.EMAIL || "";
const password = process.env.PASSWORD || "";

export default async function scrapeData() {

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        storageState: 'cookies.json'
    });

    const page = await context.newPage();

    if (fs.existsSync(COOKIE_PATH)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, "utf-8"));
        await context.addCookies(cookies);
    }

    await page.goto("https://www.rentila.com/landlord/#dashboard");

    if (await page.locator("[name='email']").count() > 0) {
        console.log("User is not logged in, please solve the CAPTCHA manually.");
        await page.pause();
        await page.locator("[name='email']").fill(email);
        await page.locator("[name='password']").fill(password);
        await page.locator("[type='submit']").click();
        await page.waitForURL("https://www.rentila.com/landlord/#dashboard");

        const cookies = await context.cookies();
        fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
    }

    await page.goto(
        `https://www.rentila.com/landlord/#payments?page=0&FilterPeriodFrom=${getCurrentDate(
            "01"
        )}&FilterPeriodTo=${getCurrentDate("30")}&FilterPropertyID=&FilterLeaseID=&FilterPaymentType=&FilterPaymentStatus=paid&FilterKeyword=`
    );
    await page.waitForSelector("#example-datatables_wrapper table tbody tr.month ~ tr");

    await page.locator('#example-datatables_wrapper table tbody tr.month ~ tr input[type="checkbox"]')
        .evaluateAll((checkboxes) => checkboxes.map((checkbox) => (checkbox as HTMLInputElement).click()));

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('a[data-original-title="Exporter les quittances sélectionnées"]').click()
    ]);

    const downloadPath = './downloads/quittances.zip';
    const extractPath = './downloads/';


    if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true });
    }

    try {
        await download.saveAs(downloadPath);

        if (path.extname(downloadPath) === '.zip') {
            await new Promise((resolve, reject) => {
                fs.createReadStream(downloadPath)
                    .pipe(unzipper.Extract({ path: extractPath }))
                    .on('close', resolve)
                    .on('error', reject);
            });
        }

        await handleExtraction(extractPath).then((message) => {
            console.log("OK MESSAGE SEND ", message);
            fs.rmdir(extractPath, { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }).catch(console.error);

    } catch (error) {
        console.error(error);
    }
}