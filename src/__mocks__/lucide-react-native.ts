/**
 * Lucide React Native Mock
 *
 * Mock for Jest testing of lucide-react-native icons.
 */

const React = require('react');

// Mock icon component factory
const mockIcon = (name: string) => {
  const MockIcon = (props: Record<string, unknown>) => {
    return React.createElement('svg', { ...props, 'data-testid': name });
  };
  MockIcon.displayName = name;
  return MockIcon;
};

// Export all icons used in the app
export const Anchor = mockIcon('Anchor');
export const Calendar = mockIcon('Calendar');
export const BarChart2 = mockIcon('BarChart2');
export const User = mockIcon('User');
export const ChevronLeft = mockIcon('ChevronLeft');
export const ChevronRight = mockIcon('ChevronRight');
export const Plus = mockIcon('Plus');
export const X = mockIcon('X');
export const Check = mockIcon('Check');
export const AlertCircle = mockIcon('AlertCircle');
export const Info = mockIcon('Info');
export const Settings = mockIcon('Settings');
export const Home = mockIcon('Home');
export const Search = mockIcon('Search');
export const Menu = mockIcon('Menu');
export const Edit = mockIcon('Edit');
export const Trash = mockIcon('Trash');
export const Save = mockIcon('Save');
export const Download = mockIcon('Download');
export const Upload = mockIcon('Upload');
export const Camera = mockIcon('Camera');
export const Image = mockIcon('Image');
export const File = mockIcon('File');
export const Folder = mockIcon('Folder');
export const Clock = mockIcon('Clock');
export const MapPin = mockIcon('MapPin');
export const Phone = mockIcon('Phone');
export const Mail = mockIcon('Mail');
export const Bell = mockIcon('Bell');
export const Lock = mockIcon('Lock');
export const Unlock = mockIcon('Unlock');
export const Eye = mockIcon('Eye');
export const EyeOff = mockIcon('EyeOff');
export const Heart = mockIcon('Heart');
export const Star = mockIcon('Star');
export const Share = mockIcon('Share');
export const Copy = mockIcon('Copy');
export const Clipboard = mockIcon('Clipboard');
export const Link = mockIcon('Link');
export const ExternalLink = mockIcon('ExternalLink');
export const RefreshCw = mockIcon('RefreshCw');
export const RotateCw = mockIcon('RotateCw');
export const Loader = mockIcon('Loader');
export const ArrowLeft = mockIcon('ArrowLeft');
export const ArrowRight = mockIcon('ArrowRight');
export const ArrowUp = mockIcon('ArrowUp');
export const ArrowDown = mockIcon('ArrowDown');
export const MoreHorizontal = mockIcon('MoreHorizontal');
export const MoreVertical = mockIcon('MoreVertical');
export const Filter = mockIcon('Filter');
export const SortAsc = mockIcon('SortAsc');
export const SortDesc = mockIcon('SortDesc');
export const Grid = mockIcon('Grid');
export const List = mockIcon('List');
export const Layers = mockIcon('Layers');
export const Tag = mockIcon('Tag');
export const Flag = mockIcon('Flag');
export const Bookmark = mockIcon('Bookmark');
export const Archive = mockIcon('Archive');
export const Inbox = mockIcon('Inbox');
export const Send = mockIcon('Send');
export const MessageSquare = mockIcon('MessageSquare');
export const MessageCircle = mockIcon('MessageCircle');
export const HelpCircle = mockIcon('HelpCircle');
export const AlertTriangle = mockIcon('AlertTriangle');
export const Ban = mockIcon('Ban');
export const Slash = mockIcon('Slash');
export const Shield = mockIcon('Shield');
export const Key = mockIcon('Key');
export const LogIn = mockIcon('LogIn');
export const LogOut = mockIcon('LogOut');
export const UserPlus = mockIcon('UserPlus');
export const Users = mockIcon('Users');
export const DollarSign = mockIcon('DollarSign');
export const CreditCard = mockIcon('CreditCard');
export const Wallet = mockIcon('Wallet');
export const Receipt = mockIcon('Receipt');
export const FileText = mockIcon('FileText');
export const Printer = mockIcon('Printer');
export const QrCode = mockIcon('QrCode');
export const Scan = mockIcon('Scan');
export const Ship = mockIcon('Ship');
export const Sailboat = mockIcon('Sailboat');
export const Navigation = mockIcon('Navigation');
export const Compass = mockIcon('Compass');
export const Sun = mockIcon('Sun');
export const Moon = mockIcon('Moon');
export const Cloud = mockIcon('Cloud');
export const CloudRain = mockIcon('CloudRain');
export const Wind = mockIcon('Wind');
export const Thermometer = mockIcon('Thermometer');
export const Droplets = mockIcon('Droplets');
export const Waves = mockIcon('Waves');
