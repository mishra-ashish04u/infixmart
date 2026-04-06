import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { IoMdClose } from "react-icons/io";
import CategoryCollapse from '../../CategoryCollapse';


const CategoryPanel = (props) => {

    const toggleDrawer = (newOpen) => () => {
        props.openCategoryPanel(newOpen);
    }

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" className='categoryPanel'>

        <h3 className='p-3 text-[16px] font-[500] flex items-center justify-between'>
            Shop By Categories
            <IoMdClose onClick={toggleDrawer(false)}
            className='cursor-pointer text-[20px]'/>
        </h3>


        <CategoryCollapse/>


    </Box>
  );


  return (
    <>
        <Drawer open={props.isopenCatPanel} onClose={toggleDrawer(false)}>
            {DrawerList}
        </Drawer>
    </>
  )
}

export default CategoryPanel