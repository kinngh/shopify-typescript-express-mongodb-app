import React from "react";
import { Page, Card, DataTable } from "@shopify/polaris";
import { useQuery, gql } from "@apollo/client";
import { navigate } from "hookrouter";

const ActiveSubscriptions = () => {
  const getActiveSubscriptions = gql`
    {
      appInstallation {
        activeSubscriptions {
          name
          status
          lineItems {
            plan {
              pricingDetails {
                ... on AppRecurringPricing {
                  __typename
                  price {
                    amount
                    currencyCode
                  }
                  interval
                }
              }
            }
          }
          test
        }
      }
    }
  `;

  const { loading, error, data } = useQuery(getActiveSubscriptions);

  let rows = [];
  if (loading) {
    console.log("loading", loading);
  }
  if (data) {
    console.log("Rendering Data");
    Object.entries(data.appInstallation.activeSubscriptions).map(
      ([key, value]) => {
        const { name, status, test } = value;
        const { amount, currencyCode } =
          value.lineItems[0].plan.pricingDetails.price;
        rows.push([name, status, `${test}`, `${currencyCode} ${amount}`]);
      }
    );
  }

  if (error) {
    rows.push(["Error", "Check console for more info"]);
    console.log("error", error.message);
  }

  return (
    <Page
      title="Active Subscriptions"
      breadcrumbs={[{ content: "Home", onAction: () => navigate("/") }]}
    >
      <Card>
        <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["Plan Name", "Status", "Test", "Amount"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
};

export default ActiveSubscriptions;