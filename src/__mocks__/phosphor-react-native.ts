/**
 * Phosphor React Native Mock
 *
 * Mock for Jest testing of phosphor-react-native icons.
 */

import React from 'react';

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
export const ChartBar = mockIcon('ChartBar');
export const User = mockIcon('User');
export const CaretLeft = mockIcon('CaretLeft');
export const CaretRight = mockIcon('CaretRight');
export const Plus = mockIcon('Plus');
export const X = mockIcon('X');
export const Check = mockIcon('Check');
export const WarningCircle = mockIcon('WarningCircle');
export const Info = mockIcon('Info');
export const Gear = mockIcon('Gear');
export const House = mockIcon('House');
export const MagnifyingGlass = mockIcon('MagnifyingGlass');
export const List = mockIcon('List');
export const PencilSimple = mockIcon('PencilSimple');
export const Trash = mockIcon('Trash');
export const FloppyDisk = mockIcon('FloppyDisk');
export const DownloadSimple = mockIcon('DownloadSimple');
export const UploadSimple = mockIcon('UploadSimple');
export const Camera = mockIcon('Camera');
export const Image = mockIcon('Image');
export const File = mockIcon('File');
export const Folder = mockIcon('Folder');
export const Clock = mockIcon('Clock');
export const MapPin = mockIcon('MapPin');
export const Phone = mockIcon('Phone');
export const Envelope = mockIcon('Envelope');
export const Bell = mockIcon('Bell');
export const Lock = mockIcon('Lock');
export const LockOpen = mockIcon('LockOpen');
export const Eye = mockIcon('Eye');
export const EyeSlash = mockIcon('EyeSlash');
export const Heart = mockIcon('Heart');
export const Star = mockIcon('Star');
export const ShareNetwork = mockIcon('ShareNetwork');
export const Copy = mockIcon('Copy');
export const Clipboard = mockIcon('Clipboard');
export const ClipboardText = mockIcon('ClipboardText');
export const Link = mockIcon('Link');
export const ArrowSquareOut = mockIcon('ArrowSquareOut');
export const ArrowsClockwise = mockIcon('ArrowsClockwise');
export const ArrowClockwise = mockIcon('ArrowClockwise');
export const CircleNotch = mockIcon('CircleNotch');
export const ArrowLeft = mockIcon('ArrowLeft');
export const ArrowRight = mockIcon('ArrowRight');
export const ArrowUp = mockIcon('ArrowUp');
export const ArrowDown = mockIcon('ArrowDown');
export const DotsThree = mockIcon('DotsThree');
export const DotsThreeVertical = mockIcon('DotsThreeVertical');
export const Funnel = mockIcon('Funnel');
export const SortAscending = mockIcon('SortAscending');
export const SortDescending = mockIcon('SortDescending');
export const SquaresFour = mockIcon('SquaresFour');
export const Stack = mockIcon('Stack');
export const Tag = mockIcon('Tag');
export const Flag = mockIcon('Flag');
export const BookmarkSimple = mockIcon('BookmarkSimple');
export const Archive = mockIcon('Archive');
export const Tray = mockIcon('Tray');
export const PaperPlaneTilt = mockIcon('PaperPlaneTilt');
export const ChatSquare = mockIcon('ChatSquare');
export const ChatCircle = mockIcon('ChatCircle');
export const Question = mockIcon('Question');
export const Warning = mockIcon('Warning');
export const Prohibit = mockIcon('Prohibit');
export const Slash = mockIcon('Slash');
export const Shield = mockIcon('Shield');
export const Key = mockIcon('Key');
export const SignIn = mockIcon('SignIn');
export const SignOut = mockIcon('SignOut');
export const UserPlus = mockIcon('UserPlus');
export const Users = mockIcon('Users');
export const CurrencyDollar = mockIcon('CurrencyDollar');
export const CreditCard = mockIcon('CreditCard');
export const Wallet = mockIcon('Wallet');
export const Receipt = mockIcon('Receipt');
export const FileText = mockIcon('FileText');
export const Printer = mockIcon('Printer');
export const QrCode = mockIcon('QrCode');
export const Scan = mockIcon('Scan');
export const Boat = mockIcon('Boat');
export const Sailboat = mockIcon('Sailboat');
export const NavigationArrow = mockIcon('NavigationArrow');
export const Compass = mockIcon('Compass');
export const Sun = mockIcon('Sun');
export const Moon = mockIcon('Moon');
export const Cloud = mockIcon('Cloud');
export const CloudRain = mockIcon('CloudRain');
export const Wind = mockIcon('Wind');
export const Thermometer = mockIcon('Thermometer');
export const Drop = mockIcon('Drop');
export const Waves = mockIcon('Waves');
export const Wine = mockIcon('Wine');
export const TrendUp = mockIcon('TrendUp');
