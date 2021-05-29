import fs from "fs-extra";
import path from "path";
import nodemailer, { SendMailOptions } from "nodemailer";
// import { MailOptions } from "nodemailer/lib/json-transport";

const createNewAccount = async (cacheFile: string): Promise<nodemailer.TestAccount> => {
	const account = await nodemailer.createTestAccount();
	await fs.writeJson(cacheFile, account, { encoding: "utf-8" });

	return account;
};

export const sendEmail = async (sendMailOptions: Omit<SendMailOptions, "from">, retriesLeft = 3): Promise<void> => {
	let testAccount: nodemailer.TestAccount;

	const cacheFile: string = path.join(__dirname, ".email-auth-cache.json");

	if (await fs.pathExists(cacheFile)) {
		testAccount = await fs.readJson(cacheFile);
	} else {
		// Generate test SMTP service account from ethereal.email
		// Only needed if you don't have a real mail account for testing
		testAccount = await createNewAccount(cacheFile);
	}

	console.log("test acc", testAccount);

	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass, // generated ethereal password
		},
	});

	try {
		// send mail with defined transport object
		const info = await transporter.sendMail({
			...sendMailOptions,
			from: '"lilReddit" <lilreddit@kipras.org>',
		});

		console.log("Message sent: %s", info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	} catch (err) {
		console.error(`Failed sending email, retriesLeft = \`${retriesLeft}\`, error =`, err);

		if (retriesLeft > 0) {
			testAccount = await createNewAccount(cacheFile);
			sendEmail(sendMailOptions, retriesLeft - 1);
		}
	}
};
