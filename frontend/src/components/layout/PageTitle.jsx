import { useEffect } from "react";

const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = title + " - Infinity Gadget Zone";
  }, [title]);

  return null;
};

export default PageTitle;
