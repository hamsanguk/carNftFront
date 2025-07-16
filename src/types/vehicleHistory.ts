export interface VehicleHistoryInput {
    tokenId:number;
    category: 'maintenance'|'accident';
    date: string;
    description:string;
    imageFile? :File;
}