import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    role: 'admin'|'workshop'|'user';
    current:string|null;
    children: React.ReactNode;
}

const RequireRole: React.FC<Props> = ({role,current,children})=>{
    if(current !==role){
        return <Navigate to = "/" />;
    }
    return <>{children}</>
};
export default RequireRole;