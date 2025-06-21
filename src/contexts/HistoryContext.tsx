import React,{createContext,useContext,useState,ReactNode} from "react";

interface History{
  tokenId: number;
  date: string;
  type: '정비' | '사고';
  description: string;
  workshop: string;
}
interface HistoryContextType {
  histories: History[];
  addHistory: (h: History) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [histories, setHistories] = useState<History[]>([]);

  const addHistory = (h: History) => {
    setHistories((prev) => [...prev, h]);
  };

  return (
    <HistoryContext.Provider value={{ histories, addHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
};