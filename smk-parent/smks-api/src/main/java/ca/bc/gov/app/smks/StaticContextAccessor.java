package ca.bc.gov.app.smks;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class StaticContextAccessor 
{
    private static StaticContextAccessor instance;

    @Autowired
    private ApplicationContext applicationContext;

    @PostConstruct
    public void registerInstance() 
    {
        instance = this;
    }

    public static <T> T getBean(Class<T> clazz) 
    {
        return instance.applicationContext.getBean(clazz);
    }
}
