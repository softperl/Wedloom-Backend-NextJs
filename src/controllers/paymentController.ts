import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import axios from "axios";

const createPayment = async (req: Request, res: Response) => {
  try {
    const merchant_id = process.env.MERCHANTID;
    const secret_key = process.env.PAYFAST_KEY;
    const tokenUrl = `https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken?MERCHANT_ID=${merchant_id}&SECURED_KEY=${secret_key}`;
    const tokenResponse = await axios.get(tokenUrl);

    const token =
      tokenResponse.data.ACCESS_TOKEN !== undefined
        ? tokenResponse.data.ACCESS_TOKEN
        : null;
    if (!token) {
      res.end(`Invalid Merchant ID / Secured Key`);
      return;
    }
    const basket_id = Math.floor(Math.random() * Math.floor(100));

    // var html = getHtml(
    //   token,
    //   merchant_id!,
    //   `CART-NO-${basket_id}`,
    //   "2020-05-25"
    // );
    // res.writeHead(200, { "Content-Type": "text/html" });
    // res.end(html);

    res
      .status(StatusCodes.OK)
      .json({ token, basket_id: `CART-NO-${basket_id}`, merchant_id });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const submitPayment = async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction",
      req.body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Payment failed" });
  }
};

function getHtml(
  token: string,
  merchant_id: string,
  basket_id: string,
  todays_date: string
) {
  return `<!DOCTYPE html>
  <html>
      <head>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" crossorigin="anonymous">
          <title>PayFast WebCheckout Integration Demo</title>
      </head>
      <body>
          <div class="container">
              <h2>PayFast WebCheckout Integration Demo</h2>
              
              <div class="card">
                  <div class="card-body">
                      <div class="card-header">
                          PayFast Web Checkout - Example Code
                      </div>
                      <!-- Submit form to your own backend API, which will proxy the request -->
                      <form method="post" action="https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction"> 
                          Currency Code: <input type="text" name="CURRENCY_CODE" value="PKR" /><br />
      Merchant ID: <input type="text" name="MERCHANT_ID" value="${merchant_id}" /><br />
      Token: <input type="text" name="TOKEN" value="${token}" /><br />
      Success URL: <input type="text" name="SUCCESS_URL" value="http://localhost:1337" /><br />
      Failure URL: <input type="text" name="FAILURE_URL" value="http://localhost:1337" /><br />
      Checkout URL: <input type="text" name="CHECKOUT_URL" value="https://typedwebhook.tools/webhook/cfe4e40e-8c5c-4d5b-867a-017bce41070c" /><br />
      Customer Email: <input type="text" name="CUSTOMER_EMAIL_ADDRESS" value="some-email@example.com" /><br />
      Customer Mobile: <input type="text" name="CUSTOMER_MOBILE_NO" value="323232332" /><br />
      Transaction Amount: <input type="text" name="TXNAMT" value="" /><br />
      Basket ID: <input type="text" name="BASKET_ID" value="${basket_id}" /><br />
      Transaction Date: <input type="text" name="ORDER_DATE" value="${new Date().toISOString()}" /><br />
      Signature: <input type="text" name="SIGNATURE" value="SOME-RANDOM-STRING" /><br />
      Version: <input type="text" name="VERSION" value="MERCHANT-CART-0.1" /><br />
      Item Description: <input type="text" name="TXNDESC" value="Item Purchased from Cart" /><br />
      Proccode: <input type="text" name="PROCCODE" value="00" /><br />
      Transaction Type: <input type="text" name="TRAN_TYPE" value='ECOMM_PURCHASE' /><br />
      Store ID/Terminal ID (optional): <input type="text" name="STORE_ID" value='' /><br />
      Recurring Transaction: <input type="checkbox" id="RECURRING_TXN" name="RECURRING_TXN" value="true"><br />
      <input type="submit" value="SUBMIT" />
                      </form> 
                  </div>
              </div>
          </div>
      </body>
  </html>`;
}

export { createPayment, submitPayment };
