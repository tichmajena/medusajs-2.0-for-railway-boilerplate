import { Paynow } from "paynow";

export async function paynowClient(data, phonenumber, mode, origin) {
  const PAYNOW_ID = process.env.PAYNOW_ID;
  const PAYNOW_KEY = process.env.PAYNOW_KEY;
  const PAYNOW_AUTH_EMAIL = process.env.PAYNOW_AUTH_EMAIL;

  const products = [data];

  console.log({ phonenumber, mode });
  // const authEmail = req.query.authEmail;
  // const reference = req.query.reference;

  // Create instance of Paynow class
  const paynow = new Paynow(PAYNOW_ID, PAYNOW_KEY);

  // Set return and result urls
  paynow.resultUrl = `${origin}/api/paynow`;
  paynow.returnUrl = `${origin}/app/checkout?gateway=paynow&merchantReference=1234`;

  // Create a new payment
  let payment = paynow.createPayment("Invoice 35");

  // Add items to the payment list passing in the name of the item and it's price
  products.forEach((product) => {
    payment.add(product.title, parseFloat(product.lineTotal));
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

  if (mode === "ecocash" || mode === "onemoney" || mode === "telecash") {
    paynow
      .sendMobile(
        // The payment to send to Paynow
        payment,

        // The phone number making payment
        phonenumber,
        //'0780597382',

        // The mobile money method to use.
        mode
      )
      .then(function (response) {
        console.log(response);
        if (response.success) {
          // These are the instructions to show the user.
          // Instruction for how the user can make payment
          let instructions = response.instructions; // Get Payment instructions for the selected mobile money method

          console.log(response);
          let pollUrl = response.pollUrl;

          // Get poll url for the transaction. This is the url used to check the status of the transaction.
          // You might want to save this, we recommend you do it

          console.log(pollUrl);
          return { instructions, pollUrl };
        } else {
          console.log("RESPONSE ERROR", response.error);
          return { error: response.error };
        }
      })
      .catch((ex) => {
        // Ahhhhhhhhhhhhhhh
        // *freak out*
        console.log("Your application has broken an axle", ex);
        return {};
      });
  } else {
    paynow
      .send(payment)
      .then((response) => {
        console.log(response);
        if (response.success) {
          let redirectUrl = response.redirectUrl;
          let pollUrl = response.pollUrl;

          return { instructions: "", redirectUrl, pollUrl };
        }
      })
      .catch((err) => {
        // Ahhhhh
        // *freaks out*
        console.log("your app has broken an axle", err);
        return {};
      });
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
  return {};
}
