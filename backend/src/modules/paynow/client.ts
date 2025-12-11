import { stat } from "fs";
import { Paynow } from "paynow";

export interface PaynowProduct {
  title: string;
  lineTotal: number;
}

export interface PaynowInput {
  products: PaynowProduct[];
  phonenumber: string;
  mode: string;
  origin: string;
  user: string;
  reference: string;
  currency: string;
}
export interface PaynowResponse {
  status: "ok" | "error";
  success: boolean;
  hasRedirect?: boolean;
  isInnbucks?: boolean;
  pollUrl?: string;
  instructions?: string;
}

export async function paynowClient({
  products,
  phonenumber,
  mode,
  origin,
  user,
  reference,
  currency,
}: PaynowInput): Promise<PaynowResponse> {
  const PAYNOW_ID = process.env.PAYNOW_ID;
  const PAYNOW_KEY = process.env.PAYNOW_KEY;
  const PAYNOW_USD_ID = process.env.PAYNOW_USD_ID;
  const PAYNOW_USD_KEY = process.env.PAYNOW_USD_KEY;
  const PAYNOW_AUTH_EMAIL = process.env.PAYNOW_AUTH_EMAIL;

  console.log({ phonenumber, mode });
  // const authEmail = req.query.authEmail;
  // const reference = req.query.reference;
  const ref = `?phone=${phonenumber}&mode=${mode}&host=${origin}&user=${user}`;
  const usds = ["ecocash-usd", "innbucks", "v-payments-usd", "visa-mastercard"];

  // Create instance of Paynow class
  const paynow =
    currency.toLowerCase() === "usd" || usds.indexOf(mode) > -1
      ? new Paynow(PAYNOW_USD_ID, PAYNOW_USD_KEY)
      : new Paynow(PAYNOW_ID, PAYNOW_KEY);

  // Set return and result urls
  let url = origin || "paynow-vercel.app";
  const dev = url.includes("localhost");
  //url = host;
  paynow.resultUrl = `https://${url}/api/paynow-result${ref}`;
  paynow.returnUrl = `http${
    dev ? "" : "s"
  }://${url}/api/paynow-return?gateway=paynow&merchantReference=${reference}`;

  // Create a new payment
  let payment = paynow.createPayment(reference || "Invoice");

  // Add items to the payment list passing in the name of the item and it's price
  products.forEach((product) => {
    payment.add(product.title, +product.lineTotal);
  });

  payment.authEmail = PAYNOW_AUTH_EMAIL;

  console.log("Paynow: ", paynow);
  console.log("Payment: ", payment);

  //payment.add("Apples", 3.4);

  // Send off the payment to Paynow
  // paynow.send(payment).then((response) => {
  //   // Check if request was successful
  //   console.log("SEEEEENNNT", response);
  //   if (response.success) {
  //     // Get the link to redirect the user to, then use it as you see fit
  //     let link = response.redirectUrl;
  //     console.log(link);
  //     //window.location.replace(link);

  //     res.redirect(link);
  //     //https://sebhastian.com/node-js-redirect/

  //     // Save poll url, maybe (recommended)?
  //     let pollUrl = response.pollUrl;
  //   }
  // });

  // -----------------------------------------------------

  if (
    mode === "ecocash" ||
    mode === "ecocash-usd" ||
    mode === "innbucks" ||
    mode === "onemoney" ||
    mode === "onemoney-usd" ||
    mode === "telecash"
  ) {
    payment.authEmail = PAYNOW_AUTH_EMAIL;
    console.log("Payment: ", payment);

    try {
      const response = await paynow.sendMobile(
        // The payment to send to Paynow
        payment,
        // The phone number making payment
        phonenumber,
        // The mobile money method to use.
        mode.replace("-usd", "")
      );

      console.log(response);

      return response;
    } catch (ex) {
      console.log("Your application has broken an axle", ex);
      return { status: "error", success: false };
    }
  } else {
    try {
      const response = await paynow.send(payment);
      console.log(response);
      return response;
    } catch (err) {
      console.log("your app has broken an axle", err);
      return { status: "error", success: false };
    }
  }

  // try {
  //   const res = await fetch(
  //     `https://paynow-vercel.vercel.app/api/paynow?phone=${phonenumber}&mode=${mode}`,
  //     {
  //       method: "POST",
  //       body: JSON.stringify([{ title: data.title, lineTotal: data.price }]),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   console.log("res:", res);

  //   if (res?.ok) {
  //     const paynowResponse = await res.json();
  //     return paynowResponse;
  //   } else {
  //     return "Something went wrong";
  //   }
  // } catch (err) {
  //   console.error(err);
  //   return null;
  // }
}
