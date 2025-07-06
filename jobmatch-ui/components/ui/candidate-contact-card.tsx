"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, User } from "lucide-react"
import { validateEmail, validatePhoneNumber } from "@/lib/candidate-utils"

interface CandidateContactCardProps {
    email: string
    phoneNumber?: string
    onEmailClick: () => void
    onPhoneClick: () => void
}

export function CandidateContactCard({ email, phoneNumber, onEmailClick, onPhoneClick }: CandidateContactCardProps) {
    const isValidEmail = validateEmail(email)
    const isValidPhone = phoneNumber ? validatePhoneNumber(phoneNumber) : false

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2" />
                    Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Email</p>
                            <p className={`text-sm truncate ${isValidEmail ? "text-gray-600" : "text-red-500"}`}>{email}</p>
                            {!isValidEmail && <p className="text-xs text-red-500">Invalid email format</p>}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEmailClick}
                        disabled={!isValidEmail}
                        aria-label={`Send email to ${email}`}
                    >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                    </Button>
                </div>

                {phoneNumber && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">Phone</p>
                                <p className={`text-sm ${isValidPhone ? "text-gray-600" : "text-red-500"}`}>{phoneNumber}</p>
                                {!isValidPhone && <p className="text-xs text-red-500">Invalid phone format</p>}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPhoneClick}
                            disabled={!isValidPhone}
                            aria-label={`Call ${phoneNumber}`}
                        >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
