import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface GoogleCalendarSectionProps {
  gcalConnected: boolean;
  showTokenInput: boolean;
  tokensText: string;
  calendars: any[];
  events: any[];
  error: string;
  onConnect: () => void;
  onTokensChange: (text: string) => void;
  onStoreTokens: () => void;
  onHideTokenInput: () => void;
  onLoadEvents: (calendarId: string) => void;
  onShareEvent: (event: any) => void;
}

const GoogleCalendarSection: React.FC<GoogleCalendarSectionProps> = ({
  gcalConnected,
  showTokenInput,
  tokensText,
  calendars,
  events,
  error,
  onConnect,
  onTokensChange,
  onStoreTokens,
  onHideTokenInput,
  onLoadEvents,
  onShareEvent,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {t('dashboard.googleCalendar')}
        </h3>
        
        {!gcalConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">{t('dashboard.connectGcalDescription')}</p>
            <button
              onClick={onConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              {t('dashboard.connectGcal')}
            </button>
            {showTokenInput && (
              <div className="mt-6 text-left max-w-2xl mx-auto">
                <p className="text-sm text-gray-700 mb-2">
                  {t('dashboard.gcalTokenInstructions')}
                </p>
                <textarea
                  className="w-full h-40 p-3 border border-gray-300 rounded-md font-mono text-xs"
                  placeholder='{"tokens": { "access_token": "...", "refresh_token": "...", "expiry_date": 1730000000000 }}'
                  value={tokensText}
                  onChange={(e) => onTokensChange(e.target.value)}
                />
                <div className="mt-3 flex items-center gap-3 justify-end">
                  <button
                    onClick={onHideTokenInput}
                    className="px-4 py-2 rounded-md border text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={onStoreTokens}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="check" className="w-5 h-5 text-green-600" size="sm" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {t('dashboard.gcalConnected')}
                </p>
              </div>
            </div>

            {/* Calendars */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('dashboard.calendars')}</h4>
              <div className="grid grid-cols-1 gap-3">
                {calendars.map((calendar) => (
                  <div
                    key={calendar.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onLoadEvents(calendar.id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{calendar.summary}</p>
                      <p className="text-xs text-gray-500">ID: {calendar.id}</p>
                    </div>
                    <Icon name="chevron-right" className="w-5 h-5 text-gray-400" size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">{t('dashboard.events')}</h4>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{event.summary}</p>
                      <p className="text-xs text-gray-500">
                        {t('dashboard.status')}: {event.status}
                      </p>
                      {event.start && (
                        <p className="text-xs text-gray-500">
                          {t('dashboard.start')}: {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => onShareEvent({ 
                            id: event.id, 
                            title: event.summary, 
                            start: new Date(event.start?.dateTime || event.start?.date || Date.now()), 
                            end: new Date(event.end?.dateTime || event.end?.date || Date.now()) 
                          })}
                          className="text-indigo-600 hover:text-indigo-700 text-xs"
                        >{t('common.share')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarSection;
