import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import Icon from '../../assets/icon';
import { useToggle } from '../../hooks/useToggle';

interface IProps {
    children: any;
}

const PopupLoginMt5 = (props: IProps) => {
    const { children } = props

    const [isOpen, toggleOpen, setOpen] = useToggle(false);

    return <div>
        <button className='inline-block p-2 rounded-lg gap-2 cursor-pointer justify-around items-center active text-[var(--color-text)] bg-[var(--color-background)] active hover:bg-rose-600 hover:font-medium' onClick={() => setOpen(true)}>
            <Icon name="icon-menu"/>
        </button>

        <Dialog open={isOpen} onClose={toggleOpen} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
            />
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-16 sm:pl-10">
                        <DialogPanel
                            transition
                            className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
                        >
                            <div className="relative h-full flex-col overflow-y-auto bg-white p-4 shadow-xl">
                                {children}

                                <div className="absolute top-0 right-0 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="cursor-pointer relative rounded-md text-gray-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
                                    >
                                        <XCircleIcon aria-hidden="true" className="size-6" color='black'/>
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
}

export default memo(PopupLoginMt5)