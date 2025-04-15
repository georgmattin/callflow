"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Mail, Globe, Calendar, Clock, Edit2, Save, X, AlertCircle, ExternalLink, Search, Flag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import type { Contact } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ContactDetailsProps {
  contact: Contact
  onClose: () => void
  onUpdateContact: (updatedContact: Contact) => void
}

export default function ContactDetails({ contact, onClose, onUpdateContact }: ContactDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContact, setEditedContact] = useState({ ...contact })

  const handleSaveChanges = () => {
    onUpdateContact(editedContact)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContact({ ...contact })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const searchGoogle = () => {
    if (contact.company) {
      const searchQuery = encodeURIComponent(contact.company)
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Kontakti detailid</span>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Muuda
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Tühista
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Salvesta
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Callback Alert */}
          {contact.callbackDate && (
            <Alert className="bg-blue-50 border-blue-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-medium">Tagasihelistamine planeeritud:</div>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                  <span className="mr-2">{formatDateOnly(contact.callbackDate)}</span>
                  <Clock className="h-4 w-4 mx-1 text-blue-600" />
                  <span>{contact.callbackTime}</span>
                </div>
                {contact.callbackReason && <div className="mt-1 text-sm italic">"{contact.callbackReason}"</div>}
              </AlertDescription>
            </Alert>
          )}

          {/* Requeued Alert */}
          {contact.requeued && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                See kontakt on uuesti järjekorda lisatud, kuna eelmine kõne jäi vastuseta.
              </AlertDescription>
            </Alert>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakti info</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-company">Ettevõte</Label>
                      <Input
                        id="edit-company"
                        value={editedContact.company}
                        onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Kontaktisik</Label>
                      <Input
                        id="edit-name"
                        value={editedContact.name}
                        onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Telefon</Label>
                      <Input
                        id="edit-phone"
                        value={editedContact.phone}
                        onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">E-post</Label>
                      <Input
                        id="edit-email"
                        value={editedContact.email}
                        onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Veebileht</Label>
                    <Input
                      id="edit-website"
                      value={editedContact.website || ""}
                      onChange={(e) => setEditedContact({ ...editedContact, website: e.target.value || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-registrikood">Registrikood</Label>
                    <Input
                      id="edit-registrikood"
                      value={editedContact.registrikood || ""}
                      onChange={(e) =>
                        setEditedContact({ ...editedContact, registrikood: e.target.value || undefined })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Märkmed</Label>
                    <Textarea
                      id="edit-notes"
                      value={editedContact.notes || ""}
                      onChange={(e) => setEditedContact({ ...editedContact, notes: e.target.value })}
                      rows={4}
                      placeholder="Lisa märkmed kontakti kohta..."
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioriteet</Label>
                    <Select 
                      value={editedContact.priority || "Normal"} 
                      onValueChange={(value) => setEditedContact({ ...editedContact, priority: value })}
                    >
                      <SelectTrigger id="edit-priority">
                        <SelectValue placeholder="Vali prioriteet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unreviewed">Ülevaatamata</SelectItem>
                        <SelectItem value="High">Kõrge</SelectItem>
                        <SelectItem value="Medium">Keskmine</SelectItem>
                        <SelectItem value="Normal">Tavaline</SelectItem>
                        <SelectItem value="Low">Madal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm" onClick={searchGoogle}>
                      <Search className="h-4 w-4 mr-1" />
                      Otsi Googlest
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ettevõte</p>
                      <p className="font-medium">{contact.company}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kontaktisik</p>
                      <p className="font-medium">{contact.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {contact.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">E-post</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-500" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm" onClick={searchGoogle}>
                      <Search className="h-4 w-4 mr-1" />
                      Otsi Googlest
                    </Button>
                  </div>

                  {contact.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Veebileht</p>
                      <p className="font-medium flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-gray-500" />
                        <a
                          href={`https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {contact.website}
                        </a>
                      </p>
                    </div>
                  )}

                  {contact.registrikood && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teatmik</p>
                      <p className="font-medium flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1 text-gray-500" />
                        <a
                          href={`https://www.teatmik.ee/et/personlegal/${contact.registrikood}-${contact.company.replace(/\s+/g, "-")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Vaata Teatmikus
                        </a>
                      </p>
                    </div>
                  )}

                  {contact.notes && contact.notes.trim() !== "" && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Märkmed</p>
                      <p className="font-medium whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Staatus</p>
                      <Badge
                        className={
                          contact.status === "Kohtumine"
                            ? "bg-green-100 text-green-800"
                            : contact.status === "Saada info"
                              ? "bg-blue-100 text-blue-800"
                              : contact.status === "Ei vastanud"
                                ? "bg-yellow-100 text-yellow-800"
                                : contact.status === "Pole huvitatud"
                                  ? "bg-red-100 text-red-800"
                                  : contact.status === "Helista hiljem"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                        }
                      >
                        {contact.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prioriteet</p>
                      <Badge
                        className={
                          contact.priority === "Unreviewed"
                            ? "bg-red-100 text-red-800"
                            : contact.priority === "High"
                                ? "bg-green-100 text-green-800"
                                : contact.priority === "Medium"
                                    ? "bg-orange-100 text-orange-800"
                                    : contact.priority === "Low"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-blue-100 text-blue-800"
                        }
                      >
                        <Flag className={`h-3 w-3 mr-1 ${
                          contact.priority === "Unreviewed" ? "text-red-600" :
                          contact.priority === "High" ? "text-green-600" : 
                          contact.priority === "Medium" ? "text-orange-600" : 
                          contact.priority === "Low" ? "text-gray-600" : 
                          "text-blue-600"
                        }`} />
                        {contact.priority === "Unreviewed" ? "Ülevaatamata" :
                         contact.priority === "High" ? "Kõrge" : 
                         contact.priority === "Medium" ? "Keskmine" :
                         contact.priority === "Low" ? "Madal" : 
                         "Tavaline"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lisainfo</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="social-media" 
                      checked={editedContact.lisainfo?.uses_social_media || false}
                      onCheckedChange={(checked) => 
                        setEditedContact({
                          ...editedContact,
                          lisainfo: {
                            ...editedContact.lisainfo,
                            uses_social_media: !!checked,
                            // Reset related fields if unchecked
                            ...(checked === false && {
                              social_media_account: undefined,
                              advertises_on_social_media: false
                            })
                          }
                        })
                      }
                    />
                    <Label htmlFor="social-media">Sotsiaalmeediat kasutavad?</Label>
                  </div>

                  {editedContact.lisainfo?.uses_social_media && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="social-media-account">Sotsiaalmeedia konto aadress</Label>
                        <Input
                          id="social-media-account"
                          value={editedContact.lisainfo?.social_media_account || ""}
                          onChange={(e) => 
                            setEditedContact({
                              ...editedContact,
                              lisainfo: {
                                ...editedContact.lisainfo,
                                social_media_account: e.target.value
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="social-media-ads" 
                          checked={editedContact.lisainfo?.advertises_on_social_media || false}
                          onCheckedChange={(checked) => 
                            setEditedContact({
                              ...editedContact,
                              lisainfo: {
                                ...editedContact.lisainfo,
                                advertises_on_social_media: !!checked
                              }
                            })
                          }
                        />
                        <Label htmlFor="social-media-ads">Sotsiaalmeedias reklaamivad?</Label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="google-adwords" 
                      checked={editedContact.lisainfo?.uses_google_adwords || false}
                      onCheckedChange={(checked) => 
                        setEditedContact({
                          ...editedContact,
                          lisainfo: {
                            ...editedContact.lisainfo,
                            uses_google_adwords: !!checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="google-adwords">Kas kasutavad Google AdWordsi?</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-age">Ettevõtte vanus (aastates)</Label>
                    <Input
                      id="company-age"
                      type="number"
                      min="0"
                      value={editedContact.lisainfo?.company_age || ""}
                      onChange={(e) => 
                        setEditedContact({
                          ...editedContact,
                          lisainfo: {
                            ...editedContact.lisainfo,
                            company_age: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="google-reviews" 
                      checked={editedContact.lisainfo?.has_google_reviews || false}
                      onCheckedChange={(checked) => 
                        setEditedContact({
                          ...editedContact,
                          lisainfo: {
                            ...editedContact.lisainfo,
                            has_google_reviews: !!checked,
                            // Reset review count if unchecked
                            ...(checked === false && { google_review_count: undefined })
                          }
                        })
                      }
                    />
                    <Label htmlFor="google-reviews">Kas Googles on arvustusi?</Label>
                  </div>

                  {editedContact.lisainfo?.has_google_reviews && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="google-review-count">Kui palju on arvustusi Googles</Label>
                      <Input
                        id="google-review-count"
                        type="number"
                        min="0"
                        value={editedContact.lisainfo?.google_review_count || ""}
                        onChange={(e) => 
                          setEditedContact({
                            ...editedContact,
                            lisainfo: {
                              ...editedContact.lisainfo,
                              google_review_count: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="multiple-offices" 
                      checked={editedContact.lisainfo?.has_multiple_offices || false}
                      onCheckedChange={(checked) => 
                        setEditedContact({
                          ...editedContact,
                          lisainfo: {
                            ...editedContact.lisainfo,
                            has_multiple_offices: !!checked,
                            // Reset office locations if unchecked
                            ...(checked === false && { office_locations: undefined })
                          }
                        })
                      }
                    />
                    <Label htmlFor="multiple-offices">Kas ettevõttel on mitu esindust/kontorit?</Label>
                  </div>

                  {editedContact.lisainfo?.has_multiple_offices && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="office-locations">Kus asuvad esindused/kontorid</Label>
                      <Textarea
                        id="office-locations"
                        value={editedContact.lisainfo?.office_locations || ""}
                        onChange={(e) => 
                          setEditedContact({
                            ...editedContact,
                            lisainfo: {
                              ...editedContact.lisainfo,
                              office_locations: e.target.value
                            }
                          })
                        }
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {(!contact.lisainfo || Object.keys(contact.lisainfo).length === 0) && (
                    <p className="text-gray-500 text-center py-2">Lisainfo puudub</p>
                  )}
                  
                  {contact.lisainfo?.uses_social_media && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sotsiaalmeediat kasutavad</p>
                      <p className="font-medium">Jah</p>
                      
                      {contact.lisainfo.social_media_account && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-gray-500">Sotsiaalmeedia konto</p>
                          <p className="font-medium">{contact.lisainfo.social_media_account}</p>
                        </div>
                      )}
                      
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-500">Sotsiaalmeedias reklaamivad</p>
                        <p className="font-medium">{contact.lisainfo.advertises_on_social_media ? "Jah" : "Ei"}</p>
                      </div>
                    </div>
                  )}

                  {contact.lisainfo?.uses_google_adwords !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kasutab Google AdWordsi</p>
                      <p className="font-medium">{contact.lisainfo.uses_google_adwords ? "Jah" : "Ei"}</p>
                    </div>
                  )}

                  {contact.lisainfo?.company_age !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ettevõtte vanus</p>
                      <p className="font-medium">{contact.lisainfo.company_age} aastat</p>
                    </div>
                  )}

                  {contact.lisainfo?.has_google_reviews !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Googles on arvustusi</p>
                      <p className="font-medium">{contact.lisainfo.has_google_reviews ? "Jah" : "Ei"}</p>
                      
                      {contact.lisainfo.has_google_reviews && contact.lisainfo.google_review_count !== undefined && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-gray-500">Arvustuste arv</p>
                          <p className="font-medium">{contact.lisainfo.google_review_count}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {contact.lisainfo?.has_multiple_offices !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mitu esindust/kontorit</p>
                      <p className="font-medium">{contact.lisainfo.has_multiple_offices ? "Jah" : "Ei"}</p>
                      
                      {contact.lisainfo.has_multiple_offices && contact.lisainfo.office_locations && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-gray-500">Esinduste/kontorite asukohad</p>
                          <p className="font-medium whitespace-pre-wrap">{contact.lisainfo.office_locations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call History */}
          <Card>
            <CardHeader>
              <CardTitle>Kõnede ajalugu</CardTitle>
            </CardHeader>
            <CardContent>
              {!contact.callHistory || contact.callHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Kõnede ajalugu puudub</p>
              ) : (
                <div className="space-y-4">
                  {contact.callHistory.map((call) => (
                    <div key={call.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          className={
                            call.result === "Kohtumine"
                              ? "bg-green-100 text-green-800"
                              : call.result === "Saada info"
                                ? "bg-blue-100 text-blue-800"
                                : call.result === "Ei vastanud"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : call.result === "Pole huvitatud"
                                    ? "bg-red-100 text-red-800"
                                    : call.result === "Helista hiljem"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                          }
                        >
                          {call.result}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatDate(call.date)}</span>
                      </div>

                      {call.meetingDate && call.meetingTime && (
                        <div className="flex items-center mb-2 text-sm">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="mr-2">Kohtumine:</span>
                          <span className="font-medium">{new Date(call.meetingDate).toLocaleDateString("et-EE")}</span>
                          <Clock className="h-4 w-4 mx-1 text-gray-500" />
                          <span className="font-medium">{call.meetingTime}</span>
                        </div>
                      )}

                      {call.callbackDate && call.callbackTime && (
                        <div className="flex items-center mb-2 text-sm">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="mr-2">Tagasihelistamine:</span>
                          <span className="font-medium">{new Date(call.callbackDate).toLocaleDateString("et-EE")}</span>
                          <Clock className="h-4 w-4 mx-1 text-gray-500" />
                          <span className="font-medium">{call.meetingTime}</span>
                          {call.callbackReason && (
                            <span className="ml-2 italic text-gray-600">"{call.callbackReason}"</span>
                          )}
                        </div>
                      )}

                      {call.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{call.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
