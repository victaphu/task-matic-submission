/*
curl https://connect.squareupsandbox.com/v2/online-checkout/payment-links \
  -X POST \
  -H 'Square-Version: 2023-09-25' \
  -H 'Authorization: Bearer EAAAEHwhHvxd2sXWmw75sXTfpDr4-DafItYLZIuYtxyPhzueTkV9MZfe7h2Gz8sF' \
  -H 'Content-Type: application/json' \
  -d '{
    "idempotency_key": "e8e7ba04-1ee9-4605-9b0a-0efba764a31f",
    "quick_pay": {
      "name": "Task Matic Tokens",
      "price_money": {
        "amount": 10000,
        "currency": "AUD"
      },
      "location_id": "LXX2Q0MZMQSQ1"
    }
  }'
  */
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const result = await fetch("https://connect.squareupsandbox.com/v2/online-checkout/payment-links", {
    method: "post",
    headers: {
      "Square-Version": "2023-09-25",
      "Authorization": `Bearer ${process.env.SQUARE_SANDBOX_API}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "idempotency_key": uuidv4(),
      "quick_pay": {
        "name": "Task Matic Tokens",
        "price_money": {
          "amount": 10000,
          "currency": "AUD"
        },
        "location_id": "LXX2Q0MZMQSQ1",
      },
      "payment_note": searchParams.get('address')
    })
  });
  const json = await result.json();
  console.log(json);
  return Response.json(json);
}