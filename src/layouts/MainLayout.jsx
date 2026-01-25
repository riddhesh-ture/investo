import {react} from "react";
import {AppBar, Box, Stack} from "@mui/material";
import { Outlet } from "react-router-dom";
import {AppNavBar} from "../components/dashboard/AppNavBar";
import {SideMenu} from "../components/dashboard/SideMenu";
import {AppTheme} from "../shared-theme/AppTheme";


export const MainLayout = () => {
  return (
    <AppTheme>
        <Box sx={{display: 'flex'}}>
            <SideMenu></SideMenu>
            <AppBar></AppBar>
        </Box>
    </AppTheme>
  )
}

