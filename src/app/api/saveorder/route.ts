import { adminDB } from "@/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    // Parse request body
    const reqBody = await request.json();
    const { cart, email, id, totalAmt } = reqBody;

    // Validate request data
    if (!cart || !Array.isArray(cart) || !email || !id || !totalAmt) {
      return NextResponse.json({
        success: false,
        message: "Invalid request data",
      });
    }

    // Prepare order item
    const orderItem = {
      amount: totalAmt,
      items: cart,
    };

    // Save order to Firebase if the cart is not empty
    if (cart.length) {
      const userOrdersRef = adminDB
        .collection("users")
        .doc(email)
        .collection("orders")
        .doc(id);

      const userDoc = await userOrdersRef.get();

      if (!userDoc.exists) {
        // If user document does not exist, create it with basic data
        await userOrdersRef.set({ email });
      }

      // Merge order item into the user's orders
      await userOrdersRef.set({ value: orderItem }, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: "Order saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving order:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An unexpected error occurred",
    });
  }
};
