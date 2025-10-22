import NavBar from './user/NavBar';
import { NavBarData } from '../utils/global';

export function AppSidebar() {
    return <NavBar items={NavBarData} />;
}