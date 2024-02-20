import {
  useMcQuery,
  useMcMutation,
} from "@commercetools-frontend/application-shell";
import { GRAPHQL_TARGETS } from "@commercetools-frontend/constants";
import { createSyncOrders } from "@commercetools/sync-actions";
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
  convertToActionData,
} from "../../helpers";
import FetchOrdersQuery from "./fetch-orders.ctp.graphql";
import FetchOrderDetailsQuery from "./fetch-order-details.ctp.graphql";
import UpdateOrderDetailsMutation from "./update-order-details.ctp.graphql";

export const useOrdersFetcher = ({ page, perPage, tableSorting }) => {
  const { data, error, loading } = useMcQuery(FetchOrdersQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  console.log("data", data);
  return {
    ordersPaginatedResult: data?.orders,
    error,
    loading,
  };
};

export const useOrderDetailsFetcher = (orderId) => {
  const { data, error, loading } = useMcQuery(FetchOrderDetailsQuery, {
    variables: {
      orderId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    order: data?.order,
    error,
    loading,
  };
};

export const useOrderDetailsUpdater = () => {
  const [updateOrderDetails, { loading }] = useMcMutation(
    UpdateOrderDetailsMutation
  );

  const syncStores = createSyncOrders();
  const execute = async ({ originalDraft, nextDraft }) => {
    const actions = syncStores.buildActions(
      nextDraft,
      convertToActionData(originalDraft)
    );
    try {
      return await updateOrderDetails({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          orderId: originalDraft.id,
          version: originalDraft.version,
          actions: createGraphQlUpdateActions(actions),
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
