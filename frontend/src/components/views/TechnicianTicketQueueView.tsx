import React from 'react';
import {TicketTable} from './TicketTable';
import {TicketItem,UserAccount} from '../../types/figma-tickets';
interface Props{tickets?:TicketItem[];currentUser?:UserAccount|null;onSelectTicket?:(id:string)=>void;onCreateInternalTicket?:()=>void;onAssignTicket?:(id:string,techName:string)=>void;}
export const TechnicianTicketQueueView:React.FC<Props>=({onCreateInternalTicket,...props})=><TicketTable {...props} onCreate={onCreateInternalTicket} staff/>;
