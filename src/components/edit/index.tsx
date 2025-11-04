import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNotes, postNotes } from '../../api/note';
import Icon from '../../assets/icon';
import { useToggle } from '../../hooks/useToggle';
import { Button } from '../button';
import TooltipCustom from '../tooltip';

function ComponentEdit() {
  const { t } = useTranslation();
  const [isOpen, toggleOpen, setOpen] = useToggle(false);
  const [data, setData] = useState<string>('');

  const closeShow = () => {
    fetchSaveHtml(data);
    setOpen(false);
  };

  const getNote = async () => {
    const req = await getNotes();
    setData(req.data.html);
  };

  const fetchSaveHtml = async (body: string) => {
    await postNotes({ html: body }).catch((e) => console.log(e))
  };

  useEffect(() => {
    getNote();
  }, []);

  return (
    <>
      <TooltipCustom titleTooltip={'Trình biên soạn'} handleClick={toggleOpen}>
        <Icon name="icon-note" className="w-[30px] h-[30px]" />
      </TooltipCustom>

      <Dialog open={isOpen} onClose={closeShow} className="relative z-100">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-4xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="p-2 font-bold text-lg text-center">{t('Ghi chú')}</div>
              <div className="bg-white px-4 sm:p-3 sm:py-6 sm:pt-4 md:pt-0 md:mt-4 w-auto md:w-[100vh]">
                <CKEditor
                  editor={ClassicEditor as any}
                  data={data}
                  config={{
                    toolbar: [
                      'undo',
                      'redo',
                      '|',
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      'strikethrough',
                      'highlight',
                      '|',
                      'link',
                      'blockQuote',
                      'code',
                      'codeBlock',
                      '|',
                      'bulletedList',
                      'numberedList',
                      'todoList',
                      '|',
                      'insertTable',
                      'tableColumn',
                      'tableRow',
                      'mergeTableCells',
                      '|',
                      'alignment',
                      'outdent',
                      'indent',
                      '|',
                      'horizontalLine',
                      'specialCharacters',
                      '|',
                      'findAndReplace',
                      'removeFormat',
                      'sourceEditing',
                    ],
                  }}
                  onChange={(_event, editor) => {
                    const html = editor.getData();
                    setData(html);
                  }}
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    fetchSaveHtml(data);
                  }}
                  className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
                >
                  {t('Lưu')}
                </Button>
                <Button
                  type="button"
                  data-autofocus
                  onClick={toggleOpen}
                  className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  {t('Hủy')}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default ComponentEdit;
