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
    var html = getHtml(
      token,
      merchant_id!,
      `CART-NO-${basket_id}`,
      "2020-05-25"
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const submitPayment = async (req: Request, res: Response) => {
  try {
    const { formData } = req.body; // Assuming form data is being sent as JSON
    console.log(formData, "formData");

    const response = await axios.post(
      "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction",
      {
        TOKEN: process.env.PAYFAST_TOKEN,
        PROCCODE: "00",
        TXNAMT: "10",
        CUSTOMER_MOBILE_NO: "+92300000000",
        CUSTOMER_EMAIL_ADDRESS: "email@example.com",
        SIGNATURE: "RANDOMSTRINGVALUE",
        MERCHANT_NAME: "My Merchant",
        MERCHANT_ID: process.env.MERCHANTID,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.status(StatusCodes.OK).json({ success: true, data: response.data });
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
                      <form method="post" action="/payment/submit"> 
                          <div class="row">
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Merchant ID</label>
                                      <input class="form-control" type="text" name="MERCHANT_ID" value="${merchant_id}">
                                  </div>
                              </div>
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Merchant Name</label>
                                      <input class="form-control" type="text" name="MERCHANT_NAME" value="My Merchant">
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Token</label>
                                      <input class="form-control" type="text" name="TOKEN" value="${token}">
                                  </div>
                              </div>
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Proccode</label>
                                      <input readonly="readonly" class="form-control" type="text" name="PROCCODE" value="00">
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Amount</label>
                                      <input class="form-control" type="text" name="TXNAMT" value="10">
                                  </div>
                              </div>
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Customer Mobile Number</label>
                                      <input class="form-control" type="text" name="CUSTOMER_MOBILE_NO" value="+92300000000">
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Customer Email</label>
                                      <input class="form-control" type="text" name="CUSTOMER_EMAIL_ADDRESS" value="email@example.com">
                                  </div>
                              </div>
                              <div class="col-lg-6">
                                  <div class="form-group">
                                      <label>Signature</label>
                                      <input class="form-control" type="text" name="SIGNATURE" value="RANDOMSTRINGVALUE">
                                  </div>
                              </div>
                          </div>
                          <div class="form-group">
                              <input class="btn btn-primary" type="submit" value="PAY NOW"> 
                          </div>
                      </form> 
                  </div>
              </div>
          </div>
      </body>
  </html>`;
}

export { createPayment, submitPayment };
