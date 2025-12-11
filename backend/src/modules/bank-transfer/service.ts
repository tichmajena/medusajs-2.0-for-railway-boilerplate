// src/modules/my-payment/service.ts
import { AbstractPaymentProvider } from "@medusajs/framework/utils";

import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  PaymentSessionStatus,
  CapturePaymentInput,
  CapturePaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types";

type Options = {
  apiKey: string;
};

class BankTransferProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "bank_transfer";

  // you can inject resources like logger, etc.
  constructor(container: any, options: Options) {
    super(container, options);

    // initialize your third‑party client here using options.apiKey
  }

  // TODO: implement required methods for authorize, capture, refund, etc.

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const { data: paymentSessionData, context } = input;

    console.debug("[authorizePayment] was called.");
    console.log("paymentSessionData: ", paymentSessionData);
    console.log("context: ", context);

    const data = { status: "success" };
    //TODO: What are we even doing here?
    //*   : Do we fetch end

    // "authorized" | "captured" | "pending" | "requires_more" | "error" | "canceled"
    switch (data.status) {
      case "success":
        // Successful transaction
        return {
          status: "authorized",
          data: { ...paymentSessionData, success: true },
        };

      case "failed":
        // Failed transaction
        return {
          status: "error",
          data: paymentSessionData,
        };

      default:
        // Pending transaction
        return {
          status: "pending",
          data: paymentSessionData,
        };
    }

    throw new Error("[authorizePayment] Method not implemented.");
  }
  async cancelPayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    console.debug("[cancelPayment] was called.");
    throw new Error("Method not implemented.");
  }
  //* Initiate the building of paymentSessionData
  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    console.debug("[initiatePayment] was called.");
    const { amount, currency_code, data, context } = input;
    console.log("[initiatePayment] context: ", input);

    return {
      id: (data?.session_id as string) || "",
      status: "pending",
      data,
    };
  }

  /**
   * Marks payment as captured. Transactions are 'captured' by default in Paystack.
   * So this just returns the payment session data.
   */
  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const { data: paymentSessionData } = input;
    console.debug("[capturePayment] was called.");
    return paymentSessionData;
    throw new Error("[capturePayment] Method not implemented.");
  }

  /**
   * Called when a cart item is added or shipping address is updated
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Re-initialize the payment
    console.debug("[updatePayment] was called.");
    return this.initiatePayment(input);
    throw new Error("[updatePayment] Method not implemented.");
  }
  /**
   * Called when a user updates their cart after `initiatePayment` has been called
   */
  //   async updatePaymentData(
  //     _: string,
  //     data: Record<string, unknown>
  //   ): Promise<
  //     PaymentProcessorSessionResponse["session_data"] | PaymentProcessorError
  //   > {
  //     //TODO: Forbid Changing total?
  //     console.debug("[updatePaymentData] was called.");
  //     return {
  //       session_data: {
  //         ...data, // We just return the data as is
  //       },
  //     };
  //   }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    console.debug("[deletePayment] was called.");
    return {};
    throw new Error("Method not implemented.");
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const { data: paymentSessionData } = input;
    console.debug(
      "[getPaymentStatus] was called.",
      paymentSessionData.session_data
    );
    console.debug("[getPaymentStatus] was called.", paymentSessionData);
    //TODO: Figure this one out
    //TODO: We can poll here for status updates
    const data = { status: "success" };
    switch (data?.status) {
      case "success":
        return { status: "authorized" as PaymentSessionStatus };
      case "failed":
        return { status: "error" as PaymentSessionStatus };
      default:
        return { status: "pending" as PaymentSessionStatus };
    }
    throw new Error("[getPaymentStatus] Method not implemented.");
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    console.debug("[refundPayment] was called.");
    throw new Error("[refundPayment] Method not implemented.");
  }
  /**
   * Retrieve transaction data from Paystack.
   */
  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const { data } = input;
    console.debug("[retrievePayment] was called.");
    //TODO: Actual Retreival or whatever
    return { data };
    throw new Error("[retrievePayment] Method not implemented.");
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload;

    try {
      switch (data.event_type) {
        case "authorized_amount":
          return {
            action: "authorized",
            data: {
              // session_id must be the Medusa payment session ID
              session_id: (data.metadata as Record<string, any>).session_id,
              amount: new BigNumber(data.amount as number),
            },
          };

        case "success":
          return {
            action: "captured",
            data: {
              session_id: (data.metadata as Record<string, any>).session_id,
              amount: new BigNumber(data.amount as number),
            },
          };

        default:
          return {
            action: "not_supported",
            data: {
              session_id: "",
              amount: new BigNumber(0),
            },
          };
      }
    } catch (e) {
      return {
        action: "failed",
        data: {
          session_id: (data.metadata as Record<string, any>).session_id,
          amount: new BigNumber(data.amount as number),
        },
      };
    }
  }
}

export default BankTransferProviderService;
