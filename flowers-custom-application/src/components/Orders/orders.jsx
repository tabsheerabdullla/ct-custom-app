import PropTypes from 'prop-types';

import {
  Link as RouterLink,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';

import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';

import messages from './messages';
import { getErrorMessage } from '../../helpers';

import { useOrdersFetcher } from '../../hooks/use-orders-connector';


const columns = [
  { key: 'orderid', label: 'Order number' },
//   {key:'storeid',label:'Store Id'},
  {key:'shippingmethod',label:'Shipping method'},
//   {key:'orderStatus',label:'Order status'},
  {key:'lastName',label:'Last name(billing)'},
  { key: 'total', label: 'Order total', isSortable: false },
  {key:'paymentstatus',label:"Payment status"},
//   {key:'refundstatus',label:"Refund Status"},
  {key:'customeremail',label:"Email(order)"},
  {key:'createdate',label:'Date created'},
  

];

const itemRenderer = (item, column, dataLocale, projectLanguages) => {
  let storeid = null
  let refundstatus = null
  console.log("PROCESS ENV",process.env.REACT_APP_PROJECT_KEY)
  console.log("item12312312",column.key,item)
//   item.custom.customFieldsRaw.map((custom)=>{
//     if(custom.name==="order-custom-status"){
//       refundstatus = custom.value
//     }
//   })
  switch (column.key) {
    case 'orderid' :
      return item.orderNumber
    case 'createdate' :
        return item.createdAt.split("T").join(" ").split(".")[0]
    case 'customeremail' :
          return item?.customerEmail
    case 'total' :
      return `€ ${item.totalPrice.centAmount/100} `
    // case 'storeid' :
    //   return storeid
    case 'shippingmethod' :
        return item?.shippingInfo?.shippingMethodName
    case 'lastName':
        return item?.billingAddress?.lastName
    case 'orderStatus' :
      return item?.orderState
    case 'paymentstatus':
      return item?.paymentState
    // case 'refundstatus':
    //   return refundstatus
    default:
      return item[column.key];
  }
};

const Orders = (props) => {
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'orderNumber', order: 'desc' });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project.languages,
  }));
  const { ordersPaginatedResult, error, loading } = useOrdersFetcher({
    page,
    perPage,
    tableSorting,

  });


  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
     
      <Spacings.Stack scale="xs">
      
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

     

      {loading && <LoadingSpinner />}

      {ordersPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable
            isCondensed
            columns={columns}
            rows={ordersPaginatedResult.results}
            itemRenderer={(item, column) =>
              itemRenderer(item, column, dataLocale, projectLanguages)
            }
            maxHeight={600}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(e)=>{  push(`${match.url}/orderdetails/${e.id}`)}}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPageRange="m"
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={ordersPaginatedResult.total}
          />
           
        </Spacings.Stack>
      ) : null} 
    </Spacings.Stack>
  );
};
Orders.displayName = 'Orders';
Orders.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default Orders;