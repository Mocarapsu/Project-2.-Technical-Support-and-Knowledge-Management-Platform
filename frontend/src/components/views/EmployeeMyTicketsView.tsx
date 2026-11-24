import React from 'react';
import {TicketTable} from './TicketTable';
import {TicketItem,UserAccount} from '../../types/figma-tickets';
interface Props{tickets?:TicketItem[];currentUser?:UserAccount|null;onSelectTicket?:(id:string)=>void;onCreateNew?:()=>void;}
export const EmployeeMyTicketsView:React.FC<Props>=({onCreateNew,...props})=><TicketTable {...props} onCreate={onCreateNew}/>;
