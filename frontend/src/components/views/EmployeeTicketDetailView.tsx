import React from 'react';
import {TicketDetail,TicketDetailProps} from './TicketDetail';
interface Props extends Omit<TicketDetailProps,'staff'|'onBack'>{onBackToList?:()=>void;}
export const EmployeeTicketDetailView:React.FC<Props>=({onBackToList,...props})=><TicketDetail {...props} onBack={onBackToList} staff={false}/>;
