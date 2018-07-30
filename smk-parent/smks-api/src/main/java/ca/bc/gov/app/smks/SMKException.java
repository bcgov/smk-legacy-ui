package ca.bc.gov.app.smks;

public class SMKException extends Exception
{
    private static final long serialVersionUID = 272127637832893263L;

    public SMKException(String message) 
    {
        super(message);
    }
    
    public SMKException(String message, Throwable throwable) 
    {
        super(message, throwable);
    }
}
