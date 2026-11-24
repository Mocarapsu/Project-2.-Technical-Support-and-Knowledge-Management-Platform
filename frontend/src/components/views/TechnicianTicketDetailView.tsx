import React from 'react';
import {TicketDetail,TicketDetailProps} from './TicketDetail';
interface Props extends Omit<TicketDetailProps,'staff'|'onBack'>{onBackToQueue?:()=>void;}
export const TechnicianTicketDetailView:React.FC<Props>=({onBackToQueue,...props})=><TicketDetail {...props} onBack={onBackToQueue} staff/>;
