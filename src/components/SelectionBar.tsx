import React from 'react';
import { CompactPicker } from 'react-color';
import {
  EyeDropperIcon,
  TrashIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

type Props = {};

const SelectionBar = ({ color, setColor, socket, setBrushSize }) => {
  return (
    <div className='fixed inset-x-0 bottom-8 flex justify-center items-center'>
      <div className='flex items-center fixed z-50 mb-12 bg-slate-100 shadow-xl px-8 rounded-full'>
        <div className='flex-1'>
          <a className='border-none normal-case tracking-wider text-4xl text-slate-400'>
            DrawRTC
          </a>
        </div>
        <div className='flex-none'>
          <ul className='menu menu-horizontal flex  items-center justify-items-center'>
            <li>
              <div className='dropdown dropdown-top '>
                <label
                  tabIndex={0}
                  className={` text-md btn  text-center font-bold align-middle border-none `}
                  style={{ backgroundColor: color }}
                >
                  <EyeDropperIcon
                    height={34}
                    width={34}
                    className='text-white'
                  />
                </label>
                <ul tabIndex={0} className='dropdown-content menu'>
                  <li>
                    <CompactPicker
                      color={color}
                      onChange={(e) => setColor(e.hex)}
                    />
                  </li>
                </ul>
              </div>
            </li>
            <div className='dropdown dropdown-top '>
              <label
                tabIndex={0}
                className={` text-md btn bg-white text-center items-center font-bold align-middle border-none w-[64px]`}
                style={{ color: color }}
              >
                <div className='text-[34px]'>•</div>
              </label>
              <ul
                tabIndex={0}
                className='dropdown-content menu flex justify-center items-center text-center align-middle bg-slate-100 rounded-xl mb-6 gap-4'
              >
                <li
                  className='btn w-full bg-transparent border-none text-[48px]  text-center items-center rounded-lg hover:bg-slate-400 cursor-pointer overflow-clip'
                  style={{ color: color }}
                  onClick={() => setBrushSize(5)}
                >
                  •
                </li>
                <li
                  className='btn w-full bg-transparent border-none text-[64px]  text-center items-center rounded-lg hover:bg-slate-400 cursor-pointer'
                  style={{ color: color }}
                  onClick={() => setBrushSize(15)}
                >
                  •
                </li>
                <li
                  className='btn w-full bg-transparent border-none text-[96px]  text-center items-center rounded-lg hover:bg-slate-400 cursor-pointer'
                  style={{ color: color }}
                  onClick={() => setBrushSize(25)}
                >
                  •
                </li>
              </ul>
            </div>

            <button
              className='btn bg-red-400 border-none text-black text-center align-middle hover:bg-red-600 hover:text-black ml-4'
              onClick={() => socket.emit('clear')}
            >
              <TrashIcon height={34} width={34} />
            </button>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SelectionBar;
